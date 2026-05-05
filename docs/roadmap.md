# Roadmap

## Phase 1 — Core Communication (Complete)

- [x] TCP server with persistent device connections
- [x] `PacketAccumulator` — correct framing of fragmented TCP stream
- [x] Full protocol parser — header extraction, `buildResponse()`
- [x] CRC16-CCITT validation on all incoming packets
- [x] TLV decoder — 17-byte tag records with per-record checksum validation
- [x] Command handlers: REGISTER, LOGIN, HEARTBEAT, DATA_REPORT
- [x] Device state machine (unregistered → registered → logged-in)
- [x] Structured logging (Pino)
- [x] Unit tests: CRC16, parser, TLV

## Phase 2 — Live Tracking POC (Complete)

- [x] Location engine — RSSI → distance → (x, y) in polar sector model
- [x] EMA smoothing for RSSI noise
- [x] Streak-based antenna direction confirmation (avoids direction flicker)
- [x] Dead zone filter (stationary tags stay put)
- [x] Deterministic per-tag angle spread (no random jitter)
- [x] WebSocket server — streams `tag:update` events to connected browsers
- [x] HTTP server — serves the frontend at port 8080
- [x] Browser map — live canvas with dots, trails, antenna wedges, distance rings
- [x] Tag selection in sidebar — singles out one card, dims others
- [x] Antenna directions calibrated against real hardware (A1=E, A2=S, A3=W, A4=N)

## Phase 3 — Stability & Polish (Next)

- [ ] Heartbeat watchdog — disconnect stale devices that stop sending heartbeats
- [ ] Graceful shutdown — close TCP + WS servers cleanly on SIGTERM/SIGINT
- [ ] Better RSSI calibration — measure `MEASURED_POWER` against real hardware at known distances
- [ ] Zone events — WebSocket event when a tag crosses between antenna sectors
- [ ] Tag type display — show card type label (student / e-bike / key) in the UI

## Phase 4 — Data Persistence (Future)

- [ ] PostgreSQL schema — devices, tag events, historical positions
- [ ] Persist tag detections on DATA_REPORT
- [ ] REST API — list active devices, query tag history
- [ ] Tag replay — scrub through historical position data

## Phase 5 — Advanced Features (Future)

- [ ] Multi-reader support — combine RSSI from multiple readers for trilateration
- [ ] Kalman filter — replace dead zone with proper state estimation
- [ ] Floor plan overlay — upload a room image and align the coordinate grid to it
- [ ] Multi-site / multi-tenant support
