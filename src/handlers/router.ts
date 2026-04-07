import net from 'net';
import { ParsedPacket } from '../protocol/types';
import { CMD } from '../protocol/constants';
import { logger } from '../utils/logger';
import { handleRegister } from './register';
import { handleLogin } from './login';
import { handleHeartbeat } from './heartbeat';

import { handleDataReport } from './dataReport';

export function routePacket(socket: net.Socket, packet: ParsedPacket): void {
  switch (packet.cmd) {
    case CMD.REGISTER:
      handleRegister(socket, packet);
      break;
    case CMD.LOGIN:
      handleLogin(socket, packet);
      break;
    case CMD.HEARTBEAT:
      handleHeartbeat(socket, packet);
      break;
    case CMD.DATA_REPORT:
      handleDataReport(socket, packet);
      break;
    case CMD.FIRMWARE_UPDATE:
    case CMD.CONFIG:
      logger.debug({ cmd: packet.cmd.toString(16) }, 'Unimplemented command received');
      break;
    default:
      logger.warn({ cmd: packet.cmd.toString(16), hex: packet.raw.toString('hex') }, 'Unknown command received');
      break;
  }
}
