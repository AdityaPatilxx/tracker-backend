import net from 'net';
import { logger } from '../utils/logger';
import { PacketAccumulator } from './connection';
import { parsePacket } from '../protocol/parser';
import { routePacket } from '../handlers/router';
import { deviceManager } from '../statemachine/deviceManager';

export function startTcpServer(port: number): net.Server {
  const server = net.createServer((socket) => {
    const remoteAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    logger.info({ remoteAddress }, 'Device connected');

    const accumulator = new PacketAccumulator();
    
    accumulator.on('packet', (packetBuf: Buffer) => {
      try {
        const packet = parsePacket(packetBuf);
        routePacket(socket, packet);
      } catch (err) {
        logger.error({ err, hex: packetBuf.toString('hex') }, 'Failed to parse/route packet');
      }
    });

    socket.on('data', (chunk: Buffer) => {
      accumulator.feed(chunk);
    });

    socket.on('close', () => {
      logger.info({ remoteAddress }, 'Device disconnected');
      deviceManager.removeSocket(socket);
    });

    socket.on('error', (err) => {
      logger.error({ err, remoteAddress }, 'Socket error');
    });
  });

  server.listen(port, () => {
    logger.info(`TCP server listening on port ${port}`);
  });
  
  return server;
}
