import net from 'net';
import { ParsedPacket } from '../protocol/types';
import { logger } from '../utils/logger';
import { deviceManager } from '../statemachine/deviceManager';
import { buildResponse } from '../protocol/parser';
import { RES, LOGIN_STATUS } from '../protocol/constants';

export function handleLogin(socket: net.Socket, packet: ParsedPacket): void {
  logger.info({ deviceId: packet.deviceId }, 'Device login request');

  deviceManager.updateState(packet.deviceId, { connectionState: 'logged-in' });

  const payload = Buffer.alloc(7);
  payload.writeUInt8(LOGIN_STATUS.SUCCESS, 0);
  
  const now = new Date();
  payload.writeUInt8(Math.max(0, now.getFullYear() - 2000), 1);
  payload.writeUInt8(now.getMonth() + 1, 2);
  payload.writeUInt8(now.getDate(), 3);
  payload.writeUInt8(now.getHours(), 4);
  payload.writeUInt8(now.getMinutes(), 5);
  payload.writeUInt8(now.getSeconds(), 6);

  const response = buildResponse(RES.LOGIN, packet.deviceId, payload, packet.seq, packet.version, packet.secFlag);
  socket.write(response);
  logger.debug({ deviceId: packet.deviceId }, 'Sent 0x8001 login response');
}
