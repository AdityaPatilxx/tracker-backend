"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function requireEnv(key, fallback) {
    const value = process.env[key] ?? fallback;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
exports.config = {
    tcp: {
        lbPort: parseInt(requireEnv('TCP_LB_PORT', '4900')),
        loadPort: parseInt(requireEnv('TCP_LOAD_PORT', '4901')),
        serverHost: requireEnv('SERVER_HOST', '127.0.0.1'),
    },
    api: {
        port: parseInt(requireEnv('API_PORT', '8080')),
    },
    db: {
        host: requireEnv('DB_HOST', 'localhost'),
        port: parseInt(requireEnv('DB_PORT', '5432')),
        database: requireEnv('DB_NAME', 'active_reader'),
        user: requireEnv('DB_USER', 'postgres'),
        password: requireEnv('DB_PASSWORD', 'postgres'),
        max: parseInt(requireEnv('DB_POOL_MAX', '10')),
    },
    logging: {
        level: requireEnv('LOG_LEVEL', 'debug'),
        pretty: requireEnv('LOG_PRETTY', 'true') === 'true',
    },
    device: {
        heartbeatTimeoutMs: parseInt(requireEnv('HEARTBEAT_TIMEOUT_MS', '120000')),
        watchdogIntervalMs: parseInt(requireEnv('WATCHDOG_INTERVAL_MS', '30000')),
    },
};
//# sourceMappingURL=index.js.map