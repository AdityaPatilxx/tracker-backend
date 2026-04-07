"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbLogger = exports.apiLogger = exports.protocolLogger = exports.tcpLogger = exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const config_1 = require("../config");
exports.logger = (0, pino_1.default)({
    level: config_1.config.logging.level,
    transport: config_1.config.logging.pretty
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
        : undefined,
});
// Child loggers per subsystem — keeps logs easy to filter
exports.tcpLogger = exports.logger.child({ subsystem: 'tcp' });
exports.protocolLogger = exports.logger.child({ subsystem: 'protocol' });
exports.apiLogger = exports.logger.child({ subsystem: 'api' });
exports.dbLogger = exports.logger.child({ subsystem: 'db' });
//# sourceMappingURL=logger.js.map