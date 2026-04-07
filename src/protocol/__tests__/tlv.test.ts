import { describe, it, expect } from '@jest/globals';
import { parseDataPayload, parseTagRecord } from '../tlv';

describe('TLV and Tag Parser', () => {

  it('correctly parses a valid 17-byte tag record and applies Checksum', () => {
    const buf = Buffer.alloc(17, 0);
    // Byte 0: bit 7 entering (0x80), bit 0-3 antenna (0x02) = 0x82
    buf[0] = 0x82; 
    buf[1] = 0x01; // tagType
    buf.writeUInt32BE(0x12345678, 2); // tagId (4 bytes)
    buf[7] = 0x00; // exciAddress
    buf[8] = 0x01; // voltageAlarm=true
    buf.writeInt8(-78, 9); // rssi
    buf[10] = 0x00; // reserved padding
    
    // Time: YY MM DD HH MM SS (offset 11)
    buf[11] = 26; // 2026
    buf[12] = 4;  // April
    buf[13] = 7;  // 7th
    buf[14] = 10; // 10 AM
    buf[15] = 15;
    buf[16] = 20;

    // The sum calculation
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      if (i !== 6) sum += buf[i];
    }
    buf[6] = (256 - (sum % 256)) % 256; // 2's complement

    const tag = parseTagRecord(buf, 0x8B01)!;
    expect(tag).not.toBeNull();
    expect(tag.antennaChannel).toBe(2);
    expect(tag.isEntering).toBe(true);
    expect(tag.tagId).toBe('12345678');
    expect(tag.voltageAlarm).toBe(true);
    expect(tag.rssi).toBe(-78);
    expect(tag.eventTime.getFullYear()).toBe(2026);
    expect(tag.eventTime.getMonth()).toBe(3); // 0-indexed April
  });

  it('drops packets with invalid checksums', () => {
    const buf = Buffer.alloc(17, 0);
    buf[0] = 0x82;
    // purposefully break checksum
    buf[6] = 0xFF; 
    
    const tag = parseTagRecord(buf, 0x8B01);
    expect(tag).toBeNull();
  });

  it('parses multiple TLVs robustly', () => {
    // Construct a payload containing two tag TLVs
    const tlv1 = Buffer.alloc(4 + 17, 0); // Header(4) + payload(17)
    tlv1.writeUInt16BE(0x8B01, 0);
    tlv1.writeUInt16BE(17, 2);
    tlv1[4] = 0x01; // Not entering, antenna 1
    tlv1.writeUInt32BE(0xAAAA, 6);
    // checksum setup for TLV1
    let sum = 0;
    for(let i=0; i<17; i++) { if(i!==6) sum += tlv1[4+i]; }
    tlv1[10] = (256 - (sum % 256)) % 256;

    const tlv2 = Buffer.alloc(4 + 17, 0);
    tlv2.writeUInt16BE(0x8B02, 0);
    tlv2.writeUInt16BE(17, 2);
    tlv2[4] = 0x81; // Entering, antenna 1
    tlv2.writeUInt32BE(0xBBBB, 6);
    sum = 0;
    for(let i=0; i<17; i++) { if(i!==6) sum += tlv2[4+i]; }
    tlv2[10] = (256 - (sum % 256)) % 256;

    const combined = Buffer.concat([tlv1, tlv2]);
    const tags = parseDataPayload(combined);
    
    expect(tags.length).toBe(2);
    expect(tags[0].tagId).toBe('0000AAAA');
    expect(tags[0].isEntering).toBe(false);
    expect(tags[1].tagId).toBe('0000BBBB');
    expect(tags[1].isEntering).toBe(true);
  });
});
