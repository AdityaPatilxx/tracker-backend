import { EventEmitter } from 'events';
export declare class PacketAccumulator extends EventEmitter {
    private buffer;
    feed(chunk: Buffer): void;
    private processBuffer;
}
//# sourceMappingURL=connection.d.ts.map