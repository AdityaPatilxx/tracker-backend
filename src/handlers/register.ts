import net from 'net';
import { ParsedPacket } from '../protocol/types';
import { logger } from '../utils/logger';
import { deviceManager } from '../statemachine/deviceManager';
import { buildResponse } from '../protocol/parser';
import { RES, REG_STATUS } from '../protocol/constants';
import { config } from '../config';

export function handleRegister(socket: net.Socket, packet: ParsedPacket): void {
  const deviceType = packet.payload.length >= 2 ? packet.payload.readUInt16BE(0) : 0;
  const regCode = packet.payload.length >= 6 ? packet.payload.readUInt32BE(2) : 0;
  
  logger.info({ deviceId: packet.deviceId, deviceType, regCode: regCode.toString(16) }, 'Device registration request');

  deviceManager.registerSocket(packet.deviceId, socket);
  deviceManager.updateState(packet.deviceId, { connectionState: 'registered' });

  const payload = Buffer.alloc(41, 0); 
  
  payload.writeUInt8(REG_STATUS.SUCCESS, 0);
  
  const now = new Date();
  payload.writeUInt8(Math.max(0, now.getFullYear() - 2000), 1);
  payload.writeUInt8(now.getMonth() + 1, 2);
  payload.writeUInt8(now.getDate(), 3);
  payload.writeUInt8(now.getHours(), 4);
  payload.writeUInt8(now.getMinutes(), 5);
  payload.writeUInt8(now.getSeconds(), 6);
  
  let ip = config.tcp.serverHost;
  if (ip === '127.0.0.1' && socket.localAddress && socket.localAddress !== '::1' && socket.localAddress !== '127.0.0.1') {
    ip = socket.localAddress.replace('::ffff:', '');
  }
  payload.write(ip, 7, 32, 'ascii');
  payload.writeUInt16LE(config.tcp.port, 39);

  const response = buildResponse(RES.REGISTER, packet.deviceId, payload, packet.seq, packet.version, packet.secFlag);
  
  socket.write(response);
  logger.debug({ deviceId: packet.deviceId, ip, port: config.tcp.port }, 'Sent 0x8008 registration response');
}
