"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const server_1 = require("./tcp/server");
// ─── Graceful Shutdown ────────────────────────────────────────────────────────
function setupShutdownHandlers() {
    const shutdown = (signal) => {
        logger_1.logger.info({ signal }, 'Shutdown signal received');
        // TCP server, DB pool, WebSocket server will be closed here
        // as we build those modules in later iterations
        process.exit(0);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (err) => {
        logger_1.logger.fatal({ err }, 'Uncaught exception — shutting down');
        process.exit(1);
    });
    process.on('unhandledRejection', (reason) => {
        logger_1.logger.fatal({ reason }, 'Unhandled promise rejection — shutting down');
        process.exit(1);
    });
}
// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function main() {
    setupShutdownHandlers();
    logger_1.logger.info('═══════════════════════════════════════════');
    logger_1.logger.info('  Active Reader Backend — Starting up');
    logger_1.logger.info('═══════════════════════════════════════════');
    logger_1.logger.info({ config: {
            tcpLbPort: config_1.config.tcp.lbPort,
            tcpLoadPort: config_1.config.tcp.loadPort,
            apiPort: config_1.config.api.port,
            logLevel: config_1.config.logging.level,
        } }, 'Configuration loaded');
    // Each module will be wired in here as iterations progress:
    // await connectDb();
    (0, server_1.startTcpServer)(config_1.config.tcp.lbPort);
    // startApiServer();
    logger_1.logger.info('Bootstrap complete — ready for connections');
}
main();
//# sourceMappingURL=index.js.map