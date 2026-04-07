export function calculateCRC16(buffer: Buffer): number {
  let crc = 0xFFFF;
  for (const byte of buffer) {
    let val = byte << 8;
    for (let j = 0; j < 8; j++) {
      if (((crc ^ val) & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      val <<= 1;
    }
    crc &= 0xFFFF;
  }
  return crc;
}

export function validatePacket(buffer: Buffer): boolean {
  if (buffer.length < 32) return false;
  const expectedCrc = buffer.readUInt16BE(buffer.length - 2);
  const payload = buffer.subarray(2, buffer.length - 2);
  const calculatedCrc = calculateCRC16(payload);
  return expectedCrc === calculatedCrc;
}
