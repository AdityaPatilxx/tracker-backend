// ─── Framing ──────────────────────────────────────────────────────────────────
export const START_FLAG       = Buffer.from([0x55, 0xAA]);
export const START_FLAG_LEN   = 2;
export const HEADER_LEN       = 28;  // per spec: fixed 28 bytes
export const CRC_LEN          = 2;
export const MIN_PACKET_LEN   = START_FLAG_LEN + HEADER_LEN + CRC_LEN; // 32 bytes

// ─── Command Codes (Device → Server) ─────────────────────────────────────────
export const CMD = {
  REGISTER:        0x0008,
  LOGIN:           0x0001,
  HEARTBEAT:       0x0003,
  DATA_REPORT:     0x0004,
  FIRMWARE_UPDATE: 0x000D,
  CONFIG:          0x000A,
} as const;

// ─── Response Codes (Server → Device) ────────────────────────────────────────
export const RES = {
  REGISTER:        0x8008,
  LOGIN:           0x8001,
  HEARTBEAT:       0x8003,
  DATA_REPORT:     0x8004,
  FIRMWARE_UPDATE: 0x800D,
  CONFIG:          0x800A,
} as const;

// ─── Registration Results ─────────────────────────────────────────────────────
export const REG_STATUS = {
  SUCCESS:       0x00,
  CODE_ERROR:    0xFE,
  REFUSED:       0xFF,
} as const;

// ─── Login Results ────────────────────────────────────────────────────────────
export const LOGIN_STATUS = {
  SUCCESS:                   0x00,
  SUCCESS_UPDATE_FIRMWARE:   0x02,
  SUCCESS_GET_HW_INFO:       0x03,
  SUCCESS_UPDATE_CONFIG:     0x10,
  ERROR:                     0xFE,
  REFUSED:                   0xFF,
} as const;

// ─── Heartbeat Operation Instructions (Server → Device) ──────────────────────
export const HEARTBEAT_OP = {
  NONE:                0x00,
  UPDATE_FIRMWARE:     0x02,
  RESET_DEVICE:        0x03,
  UPDATE_ANT_FIRMWARE: 0x04,
  GET_ANT_INFO:        0x05,
  SET_DEVICE_TIME:     0x06,
  CLEAR_TAG_BUFFER:    0x08,
  UPDATE_USER_CONFIG:  0x10,
  GET_DEVICE_STATUS:   0x11,
  GET_HW_INFO:         0x12,
} as const;

// ─── Device Types ─────────────────────────────────────────────────────────────
export const DEVICE_TYPE = {
  DATA_GATEWAY: 0x01,
  RFID_READER:  0x02,
  COMPUTER:     0x03,
} as const;

// ─── TLV Tag Types ────────────────────────────────────────────────────────────
export const TLV_TYPE = {
  RFID_ITEM_MONITOR: 0x8801,
  CURRENT_TAG:       0x8901,
  WRISTBAND_TAG:     0x8A01,
  TAG:               0x8B01,
  ATTENDANCE_TAG:    0x8B02,
} as const;

// ─── Tag Types (within tag data) ─────────────────────────────────────────────
export const TAG_TYPE = {
  STUDENT_CARD:      0x20,
  EBIKE_TAG:         0x30,
  EBIKE_KEY_CARD:    0x31,
} as const;

// ─── Config Parameter Types ───────────────────────────────────────────────────
export const CONFIG_PARAM = {
  ANTENNA_INFO:    0x02,
  TAG_REPORT_FLAG: 0x03,
  USER_CONFIG:     0x10,
  DEVICE_STATUS:   0x11,
  HW_INFO:         0x12,
  CONFIG_CONFIRM:  0x80,
} as const;

// ─── Protocol ─────────────────────────────────────────────────────────────────
export const PROTOCOL_VERSION = 0x0001;
export const SEC_FLAG_NONE    = 0x0000;

// ─── Firmware Update Data Types ───────────────────────────────────────────────
export const FIRMWARE_DATA_TYPE = {
  FILE_INFO:    0x00,
  FILE_CONTENT: 0x01,
  COMPLETE:     0x02,
} as const;

export const FIRMWARE_FILE_TYPE = {
  HOST:    0x01,
  ANTENNA: 0x02,
} as const;

// ─── Byte Offsets in full packet (including start flag) ───────────────────────
export const OFFSET = {
  START_FLAG: 0,
  LEN:        2,   // total length field (excludes start flag and crc)
  CMD:        4,
  SEQ:        6,
  VERSION:    10,
  SEC_FLAG:   12,
  DEVICE_ID:  14,  // 16 bytes
  PAYLOAD:    30,  // = START_FLAG_LEN + HEADER_LEN = 2 + 28
} as const;
