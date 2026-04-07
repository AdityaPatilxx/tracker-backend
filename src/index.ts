import { config } from './config';
import { logger } from './utils/logger';
import { startTcpServer } from './tcp/server';

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
function setupShutdownHandlers(): void {
  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'Shutdown signal received');
    // TCP server, DB pool, WebSocket server will be closed here
    // as we build those modules in later iterations
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception — shutting down');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Unhandled promise rejection — shutting down');
    process.exit(1);
  });
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  setupShutdownHandlers();

  logger.info('═══════════════════════════════════════════');
  logger.info('  Active Reader Backend — Starting up');
  logger.info('═══════════════════════════════════════════');
  logger.info({ config: {
    tcpLbPort:   config.tcp.lbPort,
    tcpLoadPort: config.tcp.loadPort,
    apiPort:     config.api.port,
    logLevel:    config.logging.level,
  }}, 'Configuration loaded');

  // Each module will be wired in here as iterations progress:
  // await connectDb();
  startTcpServer(config.tcp.lbPort);
  if (config.tcp.lbPort !== config.tcp.loadPort) {
    startTcpServer(config.tcp.loadPort);
  }
  // startApiServer();

  logger.info('Bootstrap complete — ready for connections');
}

main();
