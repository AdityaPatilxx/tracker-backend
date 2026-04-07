import { describe, it, expect } from '@jest/globals';
import { calculateCRC16, validatePacket } from '../crc16';

describe('CRC16 Validation', () => {
  // Test from the Registration example in the specification
  const testPacketHex = '55AA00220008000000000001000038363136393430333432303538393600010178563412A75C';
  const packetBuffer = Buffer.from(testPacketHex, 'hex');

  it('calculates the exact CRC16 expected by the spec', () => {
    // CRC is calculated on the header + payload (excludes start flag and trailing CRC)
    const payload = packetBuffer.subarray(2, packetBuffer.length - 2);
    const crc = calculateCRC16(payload);
    
    // Expected CRC from spec is 0xA75C
    expect(crc).toBe(0xA75C);
  });

  it('validates a complete valid packet', () => {
    expect(validatePacket(packetBuffer)).toBe(true);
  });

  it('rejects a packet with an invalid CRC', () => {
    const badBuffer = Buffer.from(packetBuffer);
    // Mutate CRC byte
    badBuffer[badBuffer.length - 1] = 0x00; 
    
    expect(validatePacket(badBuffer)).toBe(false);
  });

  it('rejects incomplete packets', () => {
    const tooShort = Buffer.from('55AA0022', 'hex');
    expect(validatePacket(tooShort)).toBe(false);
  });
});
