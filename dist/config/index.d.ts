export declare const config: {
    readonly tcp: {
        readonly lbPort: number;
        readonly loadPort: number;
        readonly serverHost: string;
    };
    readonly api: {
        readonly port: number;
    };
    readonly db: {
        readonly host: string;
        readonly port: number;
        readonly database: string;
        readonly user: string;
        readonly password: string;
        readonly max: number;
    };
    readonly logging: {
        readonly level: string;
        readonly pretty: boolean;
    };
    readonly device: {
        readonly heartbeatTimeoutMs: number;
        readonly watchdogIntervalMs: number;
    };
};
//# sourceMappingURL=index.d.ts.map