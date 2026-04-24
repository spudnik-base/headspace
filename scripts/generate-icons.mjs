import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url)) + '/..';

const targets = [
  { svg: 'icons/icon.svg',          png: 'icons/icon-192.png',           size: 192 },
  { svg: 'icons/icon.svg',          png: 'icons/icon-512.png',           size: 512 },
  { svg: 'icons/icon-maskable.svg', png: 'icons/icon-maskable-512.png',  size: 512 },
  { svg: 'icons/icon.svg',          png: 'icons/apple-touch-icon.png',   size: 180 },
  { svg: 'icons/icon.svg',          png: 'icons/favicon-32.png',         size: 32  }
];

for (const t of targets) {
  const src = await readFile(join(root, t.svg));
  const buf = await sharp(src, { density: 384 })
    .resize(t.size, t.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(root, t.png), buf);
  console.log(`wrote ${t.png} (${t.size}x${t.size}, ${buf.length} bytes)`);
}
