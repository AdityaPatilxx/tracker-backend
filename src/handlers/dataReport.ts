import net from 'net';
import { ParsedPacket } from '../protocol/types';
import { logger } from '../utils/logger';
import { deviceManager } from '../statemachine/deviceManager';
import { buildResponse } from '../protocol/parser';
import { RES } from '../protocol/constants';
import { parseDataPayload } from '../protocol/tlv';

export function handleDataReport(socket: net.Socket, packet: ParsedPacket): void {
  deviceManager.updateState(packet.deviceId, { 
    lastHeartbeat: new Date(), 
    connectionState: 'logged-in'
  });

  const tags = parseDataPayload(packet.payload);
  if (tags.length > 0) {
    logger.info({ deviceId: packet.deviceId, tagCount: tags.length }, 'Data report received');
  }
  
  for (const tag of tags) {
    logger.debug({
      tagId: tag.tagId,
      antenna: tag.antennaChannel,
      rssi: tag.rssi,
      isEntering: tag.isEntering,
    }, 'Tag read decoded');
  }

  // Respond with 0x8004 to confirm receipt and avoid retry storms
  const payload = Buffer.alloc(7);
  payload.writeUInt8(0x00, 0); // Status = 0 (Success)
  
  const now = new Date();
  payload.writeUInt8(Math.max(0, now.getFullYear() - 2000), 1);
  payload.writeUInt8(now.getMonth() + 1, 2);
  payload.writeUInt8(now.getDate(), 3);
  payload.writeUInt8(now.getHours(), 4);
  payload.writeUInt8(now.getMinutes(), 5);
  payload.writeUInt8(now.getSeconds(), 6);

  const response = buildResponse(RES.DATA_REPORT, packet.deviceId, payload, packet.seq, packet.version, packet.secFlag);
  socket.write(response);
}
