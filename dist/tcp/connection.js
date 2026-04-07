"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketAccumulator = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
const constants_1 = require("../protocol/constants");
const crc16_1 = require("../protocol/crc16");
class PacketAccumulator extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.buffer = Buffer.alloc(0);
    }
    feed(chunk) {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        this.processBuffer();
    }
    processBuffer() {
        while (this.buffer.length >= constants_1.MIN_PACKET_LEN) {
            if (this.buffer[0] !== constants_1.START_FLAG[0] || this.buffer[1] !== constants_1.START_FLAG[1]) {
                const idx = this.buffer.indexOf(constants_1.START_FLAG, 1);
                if (idx === -1) {
                    this.buffer = Buffer.alloc(0);
                    return;
                }
                else {
                    this.buffer = this.buffer.subarray(idx);
                    if (this.buffer.length < constants_1.MIN_PACKET_LEN)
                        return;
                }
            }
            const declaredLen = this.buffer.readUInt16BE(2);
            const totalPacketLen = declaredLen + 4;
            if (this.buffer.length < totalPacketLen) {
                return;
            }
            const packet = this.buffer.subarray(0, totalPacketLen);
            this.buffer = this.buffer.subarray(totalPacketLen);
            if ((0, crc16_1.validatePacket)(packet)) {
                this.emit('packet', packet);
            }
            else {
                logger_1.logger.warn({ hex: packet.toString('hex') }, 'Invalid packet CRC dropped');
            }
        }
    }
}
exports.PacketAccumulator = PacketAccumulator;
//# sourceMappingURL=connection.js.map