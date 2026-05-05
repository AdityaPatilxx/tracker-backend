# Setup & Instructions

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v18+ |
| Language | TypeScript (strict mode) |
| Dev runner | `ts-node-dev` (hot-reload) |
| TCP networking | Node.js `net` module |
| WebSocket / HTTP | `ws` + Node.js `http` |
| Logging | Pino + pino-pretty |
| Testing | Jest + ts-jest |

> PostgreSQL and Express are installed as dependencies but intentionally not active — persistence is deferred until after the live-tracking POC is complete.

## Prerequisites

- Node.js v18 or later
- npm

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env`. All variables have working defaults:

```env
# TCP port Active Reader devices connect to
TCP_PORT=4600

# HTTP + WebSocket port (serves the browser map)
API_PORT=8080

# IP address returned to devices in registration response
SERVER_HOST=127.0.0.1

# Logging
LOG_LEVEL=debug
LOG_PRETTY=true

# Heartbeat watchdog (not yet active)
HEARTBEAT_TIMEOUT_MS=120000
WATCHDOG_INTERVAL_MS=30000
```

## Running

```bash
# Development (hot-reload on file save)
npm run dev

# Production
npm run build
npm start

# Tests
npm test
```

## Directory Structure

```
tracker-backend/
├── public/
│   └── index.html          # Browser map (served by the WS/HTTP server)
├── src/
│   ├── index.ts            # Bootstrap: starts TCP + WS servers
│   ├── config/             # Environment variable loading
│   ├── tcp/
│   │   ├── server.ts       # net.createServer, per-connection wiring
│   │   └── connection.ts   # PacketAccumulator (TCP stream → complete packets)
│   ├── protocol/
│   │   ├── constants.ts    # Command IDs, byte offsets, TLV types
│   │   ├── types.ts        # TypeScript interfaces (ParsedPacket, TagRecord, WsEvent …)
│   │   ├── parser.ts       # parsePacket(), buildResponse()
│   │   ├── crc16.ts        # CRC16-CCITT (0x1021) calculation and validation
│   │   ├── tlv.ts          # TLV payload decoder, 17-byte tag record parser
│   │   └── __tests__/      # Unit tests: crc16, parser, tlv
│   ├── handlers/
│   │   ├── router.ts       # Dispatches packets by CMD byte
│   │   ├── register.ts     # CMD 0x0008 — device registration
│   │   ├── login.ts        # CMD 0x0001 — device login
│   │   ├── heartbeat.ts    # CMD 0x0003 — heartbeat keep-alive
│   │   └── dataReport.ts   # CMD 0x0004 — tag detection data
│   ├── location/
│   │   ├── engine.ts       # RSSI → distance → (x, y) calculation
│   │   └── reader-config.json  # Per-reader position and antenna directions
│   ├── websocket/
│   │   └── server.ts       # WS server + HTTP static file server
│   └── statemachine/
│       └── deviceManager.ts  # Singleton: tracks connected device state
└── protocol_text.txt       # Raw PDF extraction of the hardware protocol spec
```

## Adding a New Command

1. Add the command ID to `src/protocol/constants.ts` (`CMD` and `RES` objects)
2. Create a handler in `src/handlers/` following the existing pattern
3. Register it in `src/handlers/router.ts`
