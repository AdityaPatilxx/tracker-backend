"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCRC16 = calculateCRC16;
exports.validatePacket = validatePacket;
function calculateCRC16(buffer) {
    let crc = 0xFFFF;
    for (const byte of buffer) {
        let val = byte << 8;
        for (let j = 0; j < 8; j++) {
            if (((crc ^ val) & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            }
            else {
                crc <<= 1;
            }
            val <<= 1;
        }
        crc &= 0xFFFF;
    }
    return crc;
}
function validatePacket(buffer) {
    if (buffer.length < 32)
        return false;
    const expectedCrc = buffer.readUInt16BE(buffer.length - 2);
    const payload = buffer.subarray(2, buffer.length - 2);
    const calculatedCrc = calculateCRC16(payload);
    return expectedCrc === calculatedCrc;
}
//# sourceMappingURL=crc16.js.map