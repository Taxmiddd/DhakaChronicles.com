import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const markBlack = join(root, 'public', 'DC Mark Black.svg');
const logoWhite = join(root, 'public', 'dc-logo-white.svg');

const BRAND_GREEN = { r: 1, g: 107, b: 79, alpha: 1 }; // #016b4f

async function makeMarkIcon(srcPath, outputPath, size, bgColor = { r: 255, g: 255, b: 255 }, padding = 0.15) {
  const pad = Math.round(size * padding);
  const inner = size - pad * 2;
  // SVG aspect: 2717:915 ≈ 2.97:1 — fit within inner square
  const innerW = inner;
  const innerH = Math.round(inner / 2.97);
  const offsetX = pad;
  const offsetY = Math.round((size - innerH) / 2);

  const mark = await sharp(srcPath)
    .resize(innerW, innerH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: { ...bgColor, alpha: 1 } },
  })
    .composite([{ input: mark, left: offsetX, top: offsetY }])
    .png()
    .toFile(outputPath);

  console.log(`✓ ${outputPath}`);
}

async function makeOgImage(logoPath, outputPath) {
  const W = 1200;
  const H = 630;
  // Logo aspect: 3953:1191 ≈ 3.32:1
  const logoW = 600;
  const logoH = Math.round(600 / 3.32);
  const offsetX = Math.round((W - logoW) / 2);
  const offsetY = Math.round((H - logoH) / 2);

  const logo = await sharp(logoPath)
    .resize(logoW, logoH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: { width: W, height: H, channels: 4, background: { ...BRAND_GREEN, alpha: 1 } },
  })
    .composite([{ input: logo, left: offsetX, top: offsetY }])
    .png()
    .toFile(outputPath);

  console.log(`✓ ${outputPath}`);
}

async function main() {
  const whiteBackground = { r: 255, g: 255, b: 255 };
  const greenBackground = BRAND_GREEN;

  // PWA icons (white bg, black mark)
  await makeMarkIcon(markBlack, join(root, 'public', 'icons', 'icon-192.png'), 192, whiteBackground);
  await makeMarkIcon(markBlack, join(root, 'public', 'icons', 'icon-512.png'), 512, whiteBackground);

  // Apple touch icon (white bg, black mark)
  await makeMarkIcon(markBlack, join(root, 'public', 'apple-touch-icon.png'), 180, whiteBackground);

  // Favicon source (green bg, white mark — for browser tab)
  const markWhite = join(root, 'public', 'DC Mark White.svg');
  await makeMarkIcon(markWhite, join(root, 'src', 'app', 'icon.png'), 64, greenBackground, 0.12);

  // OG social card
  await makeOgImage(logoWhite, join(root, 'public', 'og-default.png'));
}

main().catch(console.error);
