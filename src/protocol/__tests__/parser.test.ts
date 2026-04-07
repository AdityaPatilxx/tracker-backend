import { describe, it, expect } from '@jest/globals';
import { parsePacket, buildResponse } from '../parser';
import { RES } from '../constants';

describe('Protocol Parser', () => {
  const registerHex = '55aa00220008000000000001000038363136393430333432303538393600010178563412a75c';
  const buffer = Buffer.from(registerHex, 'hex');

  it('correctly parses all header fields and payload', () => {
    const packet = parsePacket(buffer);
    
    expect(packet.cmd).toBe(0x0008);
    expect(packet.len).toBe(34); // 0x0022
    expect(packet.seq).toBe(0);
    expect(packet.deviceId).toBe('861694034205896'); 
    
    // Payload should be 6 bytes: 01 01 78 56 34 12
    expect(packet.payload.length).toBe(6);
    expect(packet.payload.toString('hex')).toBe('010178563412');
  });

  it('correctly builds a valid 0x8008 response packet', () => {
    // Reconstruct the response provided in the Spec doc for registration
    // Service Content of response:
    // Status (1B): 00 
    // Time (6B)  : 11 01 0E 11 16 32 
    // IP (32B)   : '218.17.157.214' null padded
    // Port (2B)  : 24 13 (4900 Little Endian)
    
    const payload = Buffer.alloc(41, 0);
    payload[0] = 0x00;
    Buffer.from([0x11, 0x01, 0x0E, 0x11, 0x16, 0x32]).copy(payload, 1);
    payload.write('218.17.157.214', 7, 32, 'ascii');
    payload.writeUInt16LE(4900, 39); // 24 13

    const devId = '861694034205896';
    const built = buildResponse(RES.REGISTER, devId, payload, 0, 0x0001, 0x0000);

    // According to spec doc, the exact response should be:
    const expectedResponseHex = '55aa004580080000000000010000383631363934303334323035383936000011010e1116323231382e31372e3135372e3231340000000000000000000000000000000000002413b641';
    
    expect(built.toString('hex')).toBe(expectedResponseHex);
  });
});
