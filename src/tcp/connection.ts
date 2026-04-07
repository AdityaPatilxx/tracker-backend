import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { MIN_PACKET_LEN, START_FLAG } from '../protocol/constants';
import { validatePacket } from '../protocol/crc16';

export class PacketAccumulator extends EventEmitter {
  private buffer: Buffer = Buffer.alloc(0);
  
  public feed(chunk: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    this.processBuffer();
  }

  private processBuffer(): void {
    while (this.buffer.length >= MIN_PACKET_LEN) {
      if (this.buffer[0] !== START_FLAG[0] || this.buffer[1] !== START_FLAG[1]) {
        const idx = this.buffer.indexOf(START_FLAG, 1);
        if (idx === -1) {
          this.buffer = Buffer.alloc(0);
          return;
        } else {
          this.buffer = this.buffer.subarray(idx);
          if (this.buffer.length < MIN_PACKET_LEN) return;
        }
      }
      
      const declaredLen = this.buffer.readUInt16BE(2);
      const totalPacketLen = declaredLen + 4;
      
      if (this.buffer.length < totalPacketLen) {
        return;
      }
      
      const packet = this.buffer.subarray(0, totalPacketLen);
      this.buffer = this.buffer.subarray(totalPacketLen);
      
      if (validatePacket(packet)) {
        this.emit('packet', packet);
      } else {
        logger.warn({ hex: packet.toString('hex') }, 'Invalid packet CRC dropped');
      }
    }
  }
}
