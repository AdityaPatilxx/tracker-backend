import { PacketAccumulator } from './src/tcp/connection';

const acc = new PacketAccumulator();

acc.on('packet', (packet) => {
  console.log('PACKET EMITTED:', packet.toString('hex'));
});

// Hex from the screenshot
const hex = '55aa00220008000000010200000032353130323835303130303030313500010378563412245d';
const buf = Buffer.from(hex, 'hex');

console.log('Feeding buffer of length:', buf.length);
acc.feed(buf);
console.log('Done feeding.');
