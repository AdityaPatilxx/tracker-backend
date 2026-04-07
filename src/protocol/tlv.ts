import { TagRecord } from './types';
import { logger } from '../utils/logger';

// The timestamp offset is from year 2000
function parseDeviceTime(buf: Buffer): Date {
  const yy = buf[0] + 2000;
  const mm = Math.max(0, buf[1] - 1); // 0-indexed
  const dd = buf[2];
  const hh = buf[3];
  const min = buf[4];
  const ss = buf[5];
  return new Date(yy, mm, dd, hh, min, ss);
}

export function parseDataPayload(payload: Buffer): TagRecord[] {
  const records: TagRecord[] = [];
  let offset = 0;
  
  while (offset < payload.length - 3) {
    const tlvType = payload.readUInt16BE(offset);
    const len = payload.readUInt16BE(offset + 2);
    offset += 4;
    
    if (offset + len > payload.length) {
      break; // Safe boundary check
    }
    
    const value = payload.subarray(offset, offset + len);
    offset += len;
    
    // 0x8B01 / 0x8B02 define individual tag records
    if (tlvType === 0x8B01 || tlvType === 0x8B02) {
      if (value.length >= 17) {
        const record = parseTagRecord(value, tlvType);
        if (record) records.push(record);
      }
    }
  }
  
  return records;
}

export function parseTagRecord(value: Buffer, tlvType: number): TagRecord | null {
  // Checksum validation: ~sum + 1 logic applies to bytes 0..16
  // Practically, a valid checksum means the sum modulus 256 is 0
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += value[i];
  }
  if ((sum & 0xFF) !== 0) {
    logger.warn({ hex: value.toString('hex'), sum }, 'Dropped tag record due to hardware checksum mismatch');
    return null; // Silent drop on hardware corruption
  }
  
  const byte0 = value[0];
  const isEntering = (byte0 & 0x80) !== 0; // bit 7
  const antennaChannel = byte0 & 0x0F; // low 4 bits
  
  const tagType = value[1];
  const tagId = value.readUInt32BE(2).toString(16).toUpperCase().padStart(8, '0');
  const checksum = value[6];
  const exciAddress = value[7];
  const voltageAlarm = value[8] !== 0; // status
  const rssi = value.readInt8(9);
  const eventTime = parseDeviceTime(value.subarray(11, 17));
  
  return {
    tlvType,
    antennaChannel,
    isEntering,
    isBaseStation: tagType === 0x02,
    tagType,
    tagId,
    checksum,
    exciAddress,
    voltageAlarm,
    rssi,
    eventTime
  };
}
