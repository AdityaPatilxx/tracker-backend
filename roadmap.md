# Project Roadmap: Active Reader Tracker

This roadmap outlines the journey from raw TCP data to a real-time location visualization system.

## Phase 1: Core Communication (Completed)
- [x] Basic TCP server implementation.
- [x] Packet framing and assembly (PacketAccumulator).
- [x] Command parsing (Registration, Heartbeat, Tag Reports).
- [x] CRC16 validation for data integrity.
- [x] TLV decoding for tag payload.

## Phase 2: POC - Live Tracking & Visualization (Current)
- [/] WebSocket server for real-time streaming of tag updates.
- [ ] Basic Frontend: Simple map visualization (React or Vanilla JS).
- [ ] Live plotting: Display tags on a map as they are detected.
- [ ] Device State: Basic online/offline indicator for readers.

## Phase 3: Location Intelligence (Refining Accuracy)
- [ ] RSSI-based proximity estimation (calculating distance from reader).
- [ ] Antenna-aware mapping (mapping antenna IDs to specific zones).
- [ ] Smoothing: Basic filtering to prevent "jumping" tags.
- [ ] Zone-based events: Alerts when a tag enters or leaves a specific area.

## Phase 4: Data Persistence & History (Future)
- [ ] PostgreSQL integration for storing:
    - Registered devices (Base Stations).
    - Historical tag movement logs (for "replay" functionality).
- [ ] REST API for:
    - Listing active devices.
    - Querying historical tag data.

## Phase 5: Stability & Advanced Features
- [ ] Robust reconnection handling and session persistence.
- [ ] Detailed logging for hardware communication diagnostics.
- [ ] Secure communication (if supported by hardware).
- [ ] Multi-tenant support for different sites/maps.
