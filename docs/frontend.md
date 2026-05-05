# Frontend — Live Tracking Map

`public/index.html` — single self-contained file (HTML + CSS + vanilla JS, no build step).

## Access

Start the server (`npm run dev`) then open `http://localhost:8080`.

The page connects to `ws://localhost:8080` automatically and reconnects every 2 seconds if the connection drops.

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [antenna icon] Active Reader  [Tags N] [Events N] [time]  ● LIVE │
├────────────────────────────────────┬────────────────────────┤
│                                    │  ACTIVE TAGS (N)  [✕ Clear] │
│         Canvas map                 ├────────────────────────┤
│                                    │  ● TAGID     ↑ IN      │
│  • reader box at centre            │  ████████░ -13 dBm     │
│  • antenna wedges (N/S/E/W)        │  Ant 4 (N) · just now  │
│  • distance rings (100/200/300/400)│                        │
│  • tag dots with trails            │  ● TAGID     ↓ OUT     │
│  • floating info card on selection │  ████░░░░░ -44 dBm     │
│                                    │  Ant 1 (E) · 3s ago    │
└────────────────────────────────────┴────────────────────────┘
│ Map space: 1000 × 1000 units · Reader at centre (500, 500) · [device ID] │
```

## Map Canvas

- **Grid**: 10×10 subdivisions
- **Distance rings**: dashed circles at 100, 200, 300, 400 map units from the reader
- **Antenna wedges**: 90° arc sectors labelled `A1 · E`, `A2 · S`, `A3 · W`, `A4 · N`
- **Reader**: blue square at centre with breathing halo (shows server is live)
- **Tag dots**: coloured circles. Solid border = entering range; dashed border = leaving range
- **Tag labels**: last 4 characters of tag ID shown above each dot
- **Trails**: last 8 positions shown as a fading path (only for selected tag when one is selected)
- **Pulse**: expanding ring on each position update

## Tag Selection

Click any entry in the right sidebar to single out that tag:
- All other tags dim to ~12% opacity
- Selected tag enlarges (12px vs 8px radius), shows full ID on canvas, animated selection ring
- Floating info card appears near the dot: full ID, RSSI with colour coding, antenna + direction, entering/leaving state
- **Clear button** appears in the sidebar header
- Click canvas (anywhere) or the Clear button to deselect

## Sidebar

Tags are sorted by RSSI — strongest signal (closest to reader) first.

Each entry shows:
- Coloured dot matching the map
- Full 8-character tag ID
- Direction badge: `↑ IN` (green) or `↓ OUT` (red)
- RSSI bar: green (> -40 dBm), yellow (> -60), orange (> -75), red (weaker)
- Antenna number and cardinal direction
- Age of last update

Tags fade from the map after 30 seconds of no updates and are removed at 60 seconds.

## WebSocket Events

The server sends JSON messages of this shape:

```typescript
{
  type:      "tag:update",
  deviceId:  "260329101000085",
  timestamp: "2026-05-05T12:13:22.766Z",
  data: {
    tagId:          "3E0A9731",
    tagType:        17,
    antennaChannel: 1,
    rssi:           -36,
    isEntering:     false,
    eventTime:      "2026-05-05T06:43:25.000Z",
    position:       { x: 512, y: 498 }   // null if device not in reader-config.json
  }
}
```

`position` is `null` / absent if the device ID is not present in `src/location/reader-config.json`.

## Configuring Antenna Directions

Edit `src/location/reader-config.json` to match your physical deployment:

```json
{
  "YOUR_DEVICE_ID": {
    "x": 500,
    "y": 500,
    "antennas": {
      "1": { "angle": 0,   "beamWidth": 90 },
      "2": { "angle": 90,  "beamWidth": 90 },
      "3": { "angle": 180, "beamWidth": 90 },
      "4": { "angle": 270, "beamWidth": 90 }
    }
  }
}
```

Angle convention (canvas coordinates):
- `0°` = East (right)
- `90°` = South (down)
- `180°` = West (left)
- `270°` = North (up)

The frontend `ANTENNAS` array in `public/index.html` must mirror these angles for the wedge labels to match.

## Known Limitations

- **RSSI-based distance is approximate** — `MEASURED_POWER = -50` is a default, not calibrated. Measure the actual RSSI at 1 metre from the reader and update the constant in `src/location/engine.ts`.
- **Single reader** — with one reader box, only direction + distance can be estimated. True x/y accuracy requires at least 3 spatially separated readers (trilateration).
- **No persistence** — tag history is in-memory only. A server restart clears all state.
- **No auth** — the WebSocket and HTTP server have no authentication. For production use, add at minimum IP allowlisting.
