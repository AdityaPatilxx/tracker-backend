# Communication Protocol

Based on the Active Reader Communication Protocol V1.6 (2017-09-19). Raw protocol text is in `protocol_text.txt`.

## Packet Structure

Every packet (device → server and server → device) follows this layout:

| Offset | Field | Size | Description |
|--------|-------|------|-------------|
| 0 | Start Flag | 2 B | Always `0x55 0xAA` |
| 2 | Length | 2 B | Header + Payload length (excludes Start Flag and CRC) |
| 4 | Command | 2 B | Command/response code |
| 6 | Sequence | 4 B | Packet sequence number (UInt32 big-endian) |
| 10 | Version | 2 B | Protocol version (`0x0001`) |
| 12 | Security Flag | 2 B | `0x0000` (no encryption) |
| 14 | Device ID | 16 B | ASCII device serial, null-padded |
| 30 | Payload | variable | Command-specific content |
| last 2 | CRC16 | 2 B | Checksum (see below) |

Total minimum packet size: 32 bytes (2 start + 28 header + 2 CRC, zero-length payload).

## CRC16

**Algorithm**: CRC16-CCITT — polynomial `0x1021`, initial value `0xFFFF`.

**Coverage**: bytes from the Length field (offset 2) through to the end of the Payload, exclusive of Start Flag and the CRC bytes themselves.

```typescript
function calculateCRC16(buffer: Buffer): number {
  let crc = 0xFFFF;
  for (const byte of buffer) {
    let val = byte << 8;
    for (let j = 0; j < 8; j++) {
      crc = ((crc ^ val) & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
      val <<= 1;
    }
    crc &= 0xFFFF;
  }
  return crc;
}
```

> Note: Earlier documentation incorrectly stated CRC16-Modbus (0x8005). The implementation uses 0x1021 and validates correctly against real device packets.

## Commands

### Device → Server

| Code | Name | Description |
|------|------|-------------|
| `0x0008` | REGISTER | First packet after TCP connect. Device sends device type + registration code |
| `0x0001` | LOGIN | Sent after successful registration. Contains firmware version info |
| `0x0003` | HEARTBEAT | Periodic keep-alive (every ~6 seconds) |
| `0x0004` | DATA_REPORT | Tag detection payload (TLV-encoded, see below) |

### Server → Device (responses)

Response code = command code OR'd with `0x8000`.

| Code | Name | Payload |
|------|------|---------|
| `0x8008` | REGISTER ACK | Status (1B) + Timestamp (6B) + Server IP ASCII (32B) + Port LE (2B) |
| `0x8001` | LOGIN ACK | Status (1B) + Timestamp (6B) |
| `0x8003` | HEARTBEAT ACK | Operation code (1B) + Timestamp (6B) |
| `0x8004` | DATA_REPORT ACK | Status (1B) + Timestamp (6B) |

Timestamp format in all responses: `YY MM DD HH MM SS` (6 bytes, year offset from 2000).

## DATA_REPORT Payload (TLV)

The DATA_REPORT payload is a sequence of TLV records:

```
[2B Type] [2B Length] [N bytes Value] [2B Type] [2B Length] ...
```

Only two TLV types are processed:

| Type | Description |
|------|-------------|
| `0x8B01` | Standard tag record (17 bytes) |
| `0x8B02` | Attendance tag record (17 bytes, same structure) |

Other TLV types are skipped.

### Tag Record (17 bytes)

| Byte(s) | Field | Notes |
|---------|-------|-------|
| 0 | Control | Bit 7: `1` = entering range, `0` = leaving. Bits 0–3: antenna channel (1–4) |
| 1 | Tag Type | `0x20` student card, `0x30` e-bike, `0x31` e-bike key, etc. |
| 2–5 | Tag ID | UInt32 big-endian → 8-char uppercase hex string |
| 6 | Checksum | 2's complement of sum of bytes 1–5: `((~sum) + 1) & 0xFF` |
| 7 | Exciter Address | Reserved |
| 8 | Status | Non-zero = voltage alarm |
| 9 | RSSI primary | Signed Int8 (dBm) — used if non-zero |
| 10 | RSSI fallback | Signed Int8 (dBm) — used if byte 9 is zero |
| 11–16 | Timestamp | `YY MM DD HH MM SS`, year offset from 2000 |

Records with an invalid checksum (byte 6) are dropped individually — they indicate hardware-level corruption of that tag entry.

## REGISTER Response Detail

The `0x8008` registration response tells the device which IP and port to reconnect to if it loses the connection:

```
Byte 0     : Status (0x00 = success)
Bytes 1-6  : Current server timestamp (YY MM DD HH MM SS)
Bytes 7-38 : Server IP address as ASCII string, null-padded to 32 bytes
Bytes 39-40: TCP port as UInt16 little-endian
```
