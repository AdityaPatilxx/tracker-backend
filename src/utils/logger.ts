import pino from 'pino';
import { config } from '../config';

export const logger = pino({
  level: config.logging.level,
  transport: config.logging.pretty
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
    : undefined,
});

// Child loggers per subsystem — keeps logs easy to filter
export const tcpLogger     = logger.child({ subsystem: 'tcp' });
export const protocolLogger = logger.child({ subsystem: 'protocol' });
export const apiLogger     = logger.child({ subsystem: 'api' });
export const dbLogger      = logger.child({ subsystem: 'db' });
