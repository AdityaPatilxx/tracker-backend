# Active Reader Tracker Backend

TypeScript/Node.js backend that interfaces with Active Reader RFID base stations, processes tag detection events, computes approximate positions via RSSI, and streams live updates to a browser map over WebSocket.

## Documentation

| Doc | Contents |
|-----|----------|
| [instruction.md](instruction.md) | Setup, environment variables, running the server |
| [architecture.md](architecture.md) | Component overview and data flow |
| [protocol.md](protocol.md) | Binary protocol spec — packet format, commands, TLV structure |
| [location_engine_design.md](location_engine_design.md) | Location engine algorithm, tuning constants, future plans |
| [frontend.md](frontend.md) | Web UI guide, WebSocket event format, reader config |
| [roadmap.md](roadmap.md) | Project status and planned work |

## Quick Start

```bash
npm install
cp .env.example .env   # defaults work out of the box
npm run dev
```

- TCP server: `localhost:4600` — Active Reader devices connect here
- Web UI: `http://localhost:8080` — live tracking map
