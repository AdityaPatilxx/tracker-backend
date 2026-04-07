"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OFFSET = exports.FIRMWARE_FILE_TYPE = exports.FIRMWARE_DATA_TYPE = exports.SEC_FLAG_NONE = exports.PROTOCOL_VERSION = exports.CONFIG_PARAM = exports.TAG_TYPE = exports.TLV_TYPE = exports.DEVICE_TYPE = exports.HEARTBEAT_OP = exports.LOGIN_STATUS = exports.REG_STATUS = exports.RES = exports.CMD = exports.MIN_PACKET_LEN = exports.CRC_LEN = exports.HEADER_LEN = exports.START_FLAG_LEN = exports.START_FLAG = void 0;
// ─── Framing ──────────────────────────────────────────────────────────────────
exports.START_FLAG = Buffer.from([0x55, 0xAA]);
exports.START_FLAG_LEN = 2;
exports.HEADER_LEN = 28; // per spec: fixed 28 bytes
exports.CRC_LEN = 2;
exports.MIN_PACKET_LEN = exports.START_FLAG_LEN + exports.HEADER_LEN + exports.CRC_LEN; // 32 bytes
// ─── Command Codes (Device → Server) ─────────────────────────────────────────
exports.CMD = {
    REGISTER: 0x0008,
    LOGIN: 0x0001,
    HEARTBEAT: 0x0003,
    DATA_REPORT: 0x0004,
    FIRMWARE_UPDATE: 0x000D,
    CONFIG: 0x000A,
};
// ─── Response Codes (Server → Device) ────────────────────────────────────────
exports.RES = {
    REGISTER: 0x8008,
    LOGIN: 0x8001,
    HEARTBEAT: 0x8003,
    DATA_REPORT: 0x8004,
    FIRMWARE_UPDATE: 0x800D,
    CONFIG: 0x800A,
};
// ─── Registration Results ─────────────────────────────────────────────────────
exports.REG_STATUS = {
    SUCCESS: 0x00,
    CODE_ERROR: 0xFE,
    REFUSED: 0xFF,
};
// ─── Login Results ────────────────────────────────────────────────────────────
exports.LOGIN_STATUS = {
    SUCCESS: 0x00,
    SUCCESS_UPDATE_FIRMWARE: 0x02,
    SUCCESS_GET_HW_INFO: 0x03,
    SUCCESS_UPDATE_CONFIG: 0x10,
    ERROR: 0xFE,
    REFUSED: 0xFF,
};
// ─── Heartbeat Operation Instructions (Server → Device) ──────────────────────
exports.HEARTBEAT_OP = {
    NONE: 0x00,
    UPDATE_FIRMWARE: 0x02,
    RESET_DEVICE: 0x03,
    UPDATE_ANT_FIRMWARE: 0x04,
    GET_ANT_INFO: 0x05,
    SET_DEVICE_TIME: 0x06,
    CLEAR_TAG_BUFFER: 0x08,
    UPDATE_USER_CONFIG: 0x10,
    GET_DEVICE_STATUS: 0x11,
    GET_HW_INFO: 0x12,
};
// ─── Device Types ─────────────────────────────────────────────────────────────
exports.DEVICE_TYPE = {
    DATA_GATEWAY: 0x01,
    RFID_READER: 0x02,
    COMPUTER: 0x03,
};
// ─── TLV Tag Types ────────────────────────────────────────────────────────────
exports.TLV_TYPE = {
    RFID_ITEM_MONITOR: 0x8801,
    CURRENT_TAG: 0x8901,
    WRISTBAND_TAG: 0x8A01,
    TAG: 0x8B01,
    ATTENDANCE_TAG: 0x8B02,
};
// ─── Tag Types (within tag data) ─────────────────────────────────────────────
exports.TAG_TYPE = {
    STUDENT_CARD: 0x20,
    EBIKE_TAG: 0x30,
    EBIKE_KEY_CARD: 0x31,
};
// ─── Config Parameter Types ───────────────────────────────────────────────────
exports.CONFIG_PARAM = {
    ANTENNA_INFO: 0x02,
    TAG_REPORT_FLAG: 0x03,
    USER_CONFIG: 0x10,
    DEVICE_STATUS: 0x11,
    HW_INFO: 0x12,
    CONFIG_CONFIRM: 0x80,
};
// ─── Protocol ─────────────────────────────────────────────────────────────────
exports.PROTOCOL_VERSION = 0x0001;
exports.SEC_FLAG_NONE = 0x0000;
// ─── Firmware Update Data Types ───────────────────────────────────────────────
exports.FIRMWARE_DATA_TYPE = {
    FILE_INFO: 0x00,
    FILE_CONTENT: 0x01,
    COMPLETE: 0x02,
};
exports.FIRMWARE_FILE_TYPE = {
    HOST: 0x01,
    ANTENNA: 0x02,
};
// ─── Byte Offsets in full packet (including start flag) ───────────────────────
exports.OFFSET = {
    START_FLAG: 0,
    LEN: 2, // total length field (excludes start flag and crc)
    CMD: 4,
    SEQ: 6,
    VERSION: 10,
    SEC_FLAG: 12,
    DEVICE_ID: 14, // 16 bytes
    PAYLOAD: 30, // = START_FLAG_LEN + HEADER_LEN = 2 + 28
};
//# sourceMappingURL=constants.js.map