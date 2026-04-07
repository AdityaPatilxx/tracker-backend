import net from 'net';
import { ParsedPacket } from '../protocol/types';
import { logger } from '../utils/logger';
import { deviceManager } from '../statemachine/deviceManager';
import { buildResponse } from '../protocol/parser';
import { RES, HEARTBEAT_OP } from '../protocol/constants';

export function handleHeartbeat(socket: net.Socket, packet: ParsedPacket): void {
  deviceManager.updateState(packet.deviceId, { 
    lastHeartbeat: new Date(),
    connectionState: 'logged-in'
  });

  logger.debug({ deviceId: packet.deviceId }, 'Device heartbeat received');

  const payload = Buffer.alloc(7);
  payload.writeUInt8(HEARTBEAT_OP.NONE, 0);
  
  const now = new Date();
  payload.writeUInt8(Math.max(0, now.getFullYear() - 2000), 1);
  payload.writeUInt8(now.getMonth() + 1, 2);
  payload.writeUInt8(now.getDate(), 3);
  payload.writeUInt8(now.getHours(), 4);
  payload.writeUInt8(now.getMinutes(), 5);
  payload.writeUInt8(now.getSeconds(), 6);

  const response = buildResponse(RES.HEARTBEAT, packet.deviceId, payload, packet.seq, packet.version, packet.secFlag);
  socket.write(response);
}
