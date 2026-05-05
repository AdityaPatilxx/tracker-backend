# Project Instructions: Active Reader Tracker Backend

## Overview
The **Active Reader Tracker Backend** is a high-performance TCP server designed to interface with Active Reader UWB/RFID positioning base stations. Its primary goal is to track the real-time location of cards (tags) and visualize them on a map.

The system captures tag data from readers, processes signal strength (RSSI) and antenna metadata to estimate proximity, and provides a data stream for frontend visualization.

## Technology Stack
- **Runtime**: [Bun](https://bun.sh/) (also compatible with Node.js)
- **Language**: TypeScript
- **Networking**: Node `net` module for TCP, `ws` for WebSockets
- **API Framework**: Express.js
- **Database**: PostgreSQL (for persistence of tag history and device configurations)
- **Logging**: Pino (with pino-pretty for development)

## Core Concepts
1. **TCP Server**: Listens for connections from hardware readers. It must handle persistent connections and fragmented packets.
2. **Protocol Parsing**: Implements a custom binary protocol (Start Flags, Length, Command, Sequence, Checksum).
3. **TLV (Type-Length-Value)**: Tag reports use TLV formatting for flexible data encoding.
4. **State Management**: Tracks the online/offline status and heartbeat of each reader.
5. **Location Logic**: (Planned) Uses RSSI and antenna indices to determine the approximate position of a tag relative to the reader.

## Getting Started

### Prerequisites
- Node.js (v18+) or Bun
- PostgreSQL (optional for base TCP functionality, required for persistence)

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file based on `.env.example`:
```env
TCP_PORT=8000
API_PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/tracker
```

### Running the Server
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Directory Structure
- `/src/tcp`: TCP server and connection handling.
- `/src/protocol`: Protocol parsing, CRC validation, and TLV decoding.
- `/src/handlers`: Business logic for different command types.
- `/src/statemachine`: Device lifecycle and state management.
- `/src/utils`: Logging and shared helpers.
