# Active Reader Communication Protocol

This document details the binary protocol used by Active Reader devices to communicate with the backend.

## Packet Structure (Header)

All packets follow a fixed-header format followed by a variable-length payload.

| Offset | Field | Length | Description |
| :--- | :--- | :--- | :--- |
| 0 | Start Flag | 2 bytes | Always `0x55 0xAA` |
| 2 | Length | 2 bytes | Total length (excluding Start Flag and CRC) |
| 4 | Command | 1 byte | Command ID (e.g., 0x01 for Registration) |
| 5 | Sequence | 2 bytes | Incrementing packet sequence number |
| 7 | Version | 1 byte | Protocol version (usually 0x01) |
| 8 | Security | 1 byte | Encryption/Security flag |
| 9 | Device ID | 15 bytes | ASCII string of the Device Serial Number |
| 24 | Payload | Variable | Service content (TLV or raw bytes) |
| -2 | CRC16 | 2 bytes | CRC16 (Modbus) of all bytes from Length to end of Payload |

## Common Commands

| ID | Name | Direction | Description |
| :--- | :--- | :--- | :--- |
| `0x00` | Heartbeat | Device -> Server | Periodic status update |
| `0x01` | Registration | Device -> Server | Initial handshake when connecting |
| `0x02` | Tag Report | Device -> Server | Real-time tag detection data (TLV) |
| `0x03` | Config Read | Server <-> Device | Reading device configuration |

## Tag Report Payload (TLV)

Tag reports (Command `0x02`) use a Type-Length-Value format for the payload.

### TLV Structure
- **Type**: 1 byte
- **Length**: 1 byte
- **Value**: N bytes

### Supported TLV Types
- **0x01 (Tag ID)**: 4 bytes (Hex string representation)
- **0x02 (RSSI)**: 1 byte (Signed integer, e.g., -70 dBm)
- **0x03 (Antenna)**: 1 byte (Channel 1-4)
- **0x04 (Timestamp)**: 4 bytes (Unix epoch or device relative)

## Checksum Calculation
The protocol uses **CRC16-Modbus**.
- Polynomial: `0x8005`
- Initial Value: `0xFFFF`
- Input/Output Reflected: Yes

The CRC is calculated over the range starting from the **Length** field (offset 2) up to the end of the **Payload**.
