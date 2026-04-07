"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTcpServer = startTcpServer;
const net_1 = __importDefault(require("net"));
const logger_1 = require("../utils/logger");
const connection_1 = require("./connection");
function startTcpServer(port) {
    const server = net_1.default.createServer((socket) => {
        const remoteAddress = `${socket.remoteAddress}:${socket.remotePort}`;
        logger_1.logger.info({ remoteAddress }, 'Device connected');
        const accumulator = new connection_1.PacketAccumulator();
        accumulator.on('packet', (packet) => {
            logger_1.logger.debug({ hex: packet.toString('hex') }, 'Received valid packet');
        });
        socket.on('data', (chunk) => {
            accumulator.feed(chunk);
        });
        socket.on('close', () => {
            logger_1.logger.info({ remoteAddress }, 'Device disconnected');
        });
        socket.on('error', (err) => {
            logger_1.logger.error({ err, remoteAddress }, 'Socket error');
        });
    });
    server.listen(port, () => {
        logger_1.logger.info(`TCP server listening on port ${port}`);
    });
    return server;
}
//# sourceMappingURL=server.js.map