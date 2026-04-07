import { ParsedPacket } from './types';
import { OFFSET, START_FLAG_LEN, HEADER_LEN, CRC_LEN, START_FLAG } from './constants';
import { calculateCRC16 } from './crc16';

export function parsePacket(buffer: Buffer): ParsedPacket {
  const deviceIdBytes = buffer.subarray(OFFSET.DEVICE_ID, OFFSET.PAYLOAD);
  const nullIdx = deviceIdBytes.indexOf(0);
  const deviceId = deviceIdBytes.subarray(0, nullIdx === -1 ? 16 : nullIdx).toString('ascii');

  return {
    raw: buffer,
    len: buffer.readUInt16BE(OFFSET.LEN),
    cmd: buffer.readUInt16BE(OFFSET.CMD),
    seq: buffer.readUInt32BE(OFFSET.SEQ),
    version: buffer.readUInt16BE(OFFSET.VERSION),
    secFlag: buffer.readUInt16BE(OFFSET.SEC_FLAG),
    deviceId: deviceId,
    payload: buffer.subarray(OFFSET.PAYLOAD, buffer.length - 2), // exclude CRC
  };
}

export function buildResponse(
  cmd: number,
  deviceId: string,
  payload: Buffer,
  seq: number = 0,
  version: number = 0x0100,
  secFlag: number = 0x0000
): Buffer {
  const len = HEADER_LEN + payload.length;
  const totalLen = START_FLAG_LEN + len + CRC_LEN;
  const buffer = Buffer.alloc(totalLen);
  
  // Start flag
  START_FLAG.copy(buffer, 0);
  
  // Header
  buffer.writeUInt16BE(len, OFFSET.LEN);
  buffer.writeUInt16BE(cmd, OFFSET.CMD);
  buffer.writeUInt32BE(seq, OFFSET.SEQ);
  buffer.writeUInt16BE(version, OFFSET.VERSION);
  buffer.writeUInt16BE(secFlag, OFFSET.SEC_FLAG);
  
  // Device ID (pad with nulls)
  const idBuf = Buffer.alloc(16, 0);
  idBuf.write(deviceId, 0, 'ascii');
  idBuf.copy(buffer, OFFSET.DEVICE_ID);
  
  // Payload
  payload.copy(buffer, OFFSET.PAYLOAD);
  
  // Calculate CRC over Header + Payload
  const crcTarget = buffer.subarray(2, buffer.length - 2);
  const crc = calculateCRC16(crcTarget);
  buffer.writeUInt16BE(crc, buffer.length - 2);
  
  return buffer;
}
