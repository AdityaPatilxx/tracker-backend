import net from 'net';
import { logger } from '../utils/logger';
import { PacketAccumulator } from './connection';

export function startTcpServer(port: number): net.Server {
  const server = net.createServer((socket) => {
    const remoteAddress = `${socket.remoteAddress}:${socket.remotePort}`;
    logger.info({ remoteAddress }, 'Device connected');

    const accumulator = new PacketAccumulator();
    
    accumulator.on('packet', (packet: Buffer) => {
      logger.debug({ hex: packet.toString('hex') }, 'Received valid packet');
    });

    socket.on('data', (chunk: Buffer) => {
      accumulator.feed(chunk);
    });

    socket.on('close', () => {
      logger.info({ remoteAddress }, 'Device disconnected');
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
