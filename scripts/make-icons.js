const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 2; // Color type: Truecolor (RGB)
  ihdr[10] = 0; // Compression method
  ihdr[11] = 0; // Filter method
  ihdr[12] = 0; // Interlace method
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data: height rows, each starting with filter byte 0, followed by width * 3 bytes (RGB)
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    rawData[rowStart] = 0; // None filter
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 3;
      // Draw gradient or solid indigo (#6366f1) color
      const isCenter = Math.abs(x - width / 2) < width * 0.3 && Math.abs(y - height / 2) < height * 0.3;
      rawData[idx] = isCenter ? 255 : r; // R
      rawData[idx + 1] = isCenter ? 255 : g; // G
      rawData[idx + 2] = isCenter ? 255 : b; // B
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcBuf = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcBuf);
  buf.writeInt32BE(crc, 8 + len);

  return buf;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return ~c;
}

const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

const dir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Create 192x192 and 512x512 icons (indigo color #6366f1 => RGB 99, 102, 241)
fs.writeFileSync(path.join(dir, 'icon-192.png'), createPng(192, 192, 99, 102, 241));
fs.writeFileSync(path.join(dir, 'icon-512.png'), createPng(512, 512, 99, 102, 241));

console.log('✅ Iconos PWA icon-192.png e icon-512.png generados correctamente en public/icons/');
