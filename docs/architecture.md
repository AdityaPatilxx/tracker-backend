# Architecture

## Data Flow

```
Active Reader Device
       │  TCP raw stream
       ▼
┌──────────────────────┐
│  PacketAccumulator   │  buffers chunks → emits complete packets
│  src/tcp/connection  │  re-syncs to 0x55AA on garbage input
└──────────┬───────────┘
           │ Buffer (full packet)
           ▼
┌──────────────────────┐
│  Protocol Parser     │  CRC16 validation, header field extraction
│  src/protocol/parser │  → ParsedPacket
└──────────┬───────────┘
           │ ParsedPacket
           ▼
┌──────────────────────┐
│  Handler Router      │  switch on CMD byte
│  src/handlers/router │
└──┬──┬──┬──┬──────────┘
   │  │  │  │
   │  │  │  └─ DATA_REPORT 0x0004
   │  │  │          │
   │  │  │    TLV decoder (src/protocol/tlv.ts)
   │  │  │          │ TagRecord[]
   │  │  │          ▼
   │  │  │    Location Engine (src/location/engine.ts)
   │  │  │          │ { x, y } in map units
   │  │  │          ▼
   │  │  │    WS broadcast (src/websocket/server.ts)
   │  │  │          │ JSON over WebSocket
   │  │  │          ▼
   │  │  │    Browser (public/index.html)
   │  │  │
   │  │  └─── HEARTBEAT  0x0003 → updates lastHeartbeat
   │  └──────  LOGIN      0x0001 → state → 'logged-in'
   └─────────  REGISTER   0x0008 → registers socket, sends IP:port back

All handlers write a binary TCP ack back to the device.
All handlers call DeviceManager to update connection state.
```

## Components

### TCP (`src/tcp/`)

**server.ts** — `net.createServer`, one `PacketAccumulator` per connection, wires `data`/`close`/`error` socket events.

**connection.ts** — `PacketAccumulator extends EventEmitter`. Concats incoming chunks into a buffer, finds `0x55 0xAA` start flag, reads the declared length field, waits until that many bytes are available, validates CRC16, then emits `'packet'` with the complete buffer. Discards and re-syncs on corruption.

### Protocol (`src/protocol/`)

**parser.ts** — `parsePacket(buf)` reads all header fields at fixed offsets (see `constants.ts`). `buildResponse(cmd, deviceId, payload, ...)` constructs a correctly framed response including CRC.

**crc16.ts** — CRC16-CCITT: polynomial `0x1021`, initial value `0xFFFF`. Applied over bytes from the Length field to the end of the Payload (excludes Start Flag and trailing CRC bytes).

**tlv.ts** — walks the TLV payload of a DATA_REPORT. Each TLV entry with type `0x8B01` or `0x8B02` contains a 17-byte tag record. Records with an invalid per-record checksum are dropped individually.

**constants.ts** — single source of truth for CMD/RES codes, byte offsets, TLV types, status codes.

**types.ts** — shared TypeScript interfaces: `ParsedPacket`, `TagRecord`, `DeviceState`, `WsEvent`, `TagUpdateEvent`.

### Handlers (`src/handlers/`)

| File | CMD | RES | Action |
|------|-----|-----|--------|
| register.ts | 0x0008 | 0x8008 | Registers socket in DeviceManager, replies with server IP + port |
| login.ts | 0x0001 | 0x8001 | Transitions device to `logged-in` |
| heartbeat.ts | 0x0003 | 0x8003 | Updates `lastHeartbeat` timestamp |
| dataReport.ts | 0x0004 | 0x8004 | Decodes TLV → location engine → WS broadcast |

### Location Engine (`src/location/`)

**engine.ts** — stateful singleton. For each `TagRecord`:
1. Updates per-tag RSSI EMA (exponential moving average)
2. Runs streak-based antenna direction confirmation (requires N consecutive readings on the same antenna before switching direction)
3. Computes distance from smoothed RSSI via log-distance path loss, scaled to map units
4. Applies a dead zone — suppresses position updates smaller than a threshold
5. Returns `{ x, y }` in 1000×1000 map coordinates

**reader-config.json** — maps each device ID to its map position and per-antenna bearing. This file must be updated to match physical deployment.

### WebSocket Server (`src/websocket/`)

**server.ts** — creates a single HTTP server on `API_PORT`. Serves `public/index.html` at any path. Attaches a `ws.WebSocketServer` to the same HTTP server. Exports `broadcast(event: WsEvent)` which sends JSON to all connected clients.

### State Machine (`src/statemachine/`)

**deviceManager.ts** — singleton with three maps: `states` (deviceId → DeviceState), `sockets` (deviceId → Socket), `addressToDevice` (ip:port string → deviceId). Connection state lifecycle: `unregistered` → `registered` → `logged-in` → back to `unregistered` on disconnect.

## Development Notes

- **Adding a command**: add ID to `constants.ts`, add handler in `src/handlers/`, register in `router.ts`
- **Changing TLV parsing**: `src/protocol/tlv.ts` is self-contained; unit tests in `src/protocol/__tests__/tlv.test.ts`
- **Changing location behaviour**: tune constants at the top of `src/location/engine.ts`; update antenna angles in `src/location/reader-config.json`
