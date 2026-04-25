'use strict';

/**
 * 포션 아이콘 생성 스크립트
 *
 * potion.png (베이스) + potion_overlay.png (액체 영역) 를 합성해
 * 포션별 고유 색상이 입혀진 아이콘 PNG를 생성합니다.
 *
 * Minecraft 엔진의 tint 방식을 재현:
 *   1. 베이스 병 레이어 렌더
 *   2. overlay 픽셀에 potion color 곱셈(tint)
 *   3. alpha 블렌딩으로 합성
 *
 * Output: public/icons/1.21.4/potion_{RRGGBB}.png
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const { PNG } = require('pngjs');

const ROOT      = path.join(__dirname, '..');
const OUT_DIR   = path.join(ROOT, 'public', 'icons', '1.21.4');
const CACHE_DIR = path.join(ROOT, '.texture-cache', '1.21.4', 'textures', 'item');
const OUTPUT_SIZE = 192;

// potions.ts 의 color 값과 1:1 대응
const POTION_COLORS = [
  '#F82423', // healing
  '#F84040', // healing II
  '#CD5CAB', // regeneration
  '#932423', // strength
  '#7CAFC4', // speed/swiftness
  '#E49A3A', // fire resistance
  '#2E5299', // water breathing
  '#1F1FA1', // night vision
  '#7F8392', // invisibility
  '#22FF4C', // leaping
  '#4E9331', // poison
  '#5A6C81', // slowness
  '#484D48', // weakness
  '#430A09', // harming
  '#C8D8E8', // slow falling
  '#339900', // luck
];

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 404) { res.resume(); resolve(null); return; }
      if (res.statusCode !== 200) { res.resume(); reject(new Error(`HTTP ${res.statusCode}`)); return; }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function getAsset(name) {
  const cached = path.join(CACHE_DIR, `${name}.png`);
  if (fs.existsSync(cached)) return fs.readFileSync(cached);
  const url = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21.4/assets/minecraft/textures/item/${name}.png`;
  const buf = await fetchUrl(url);
  if (buf) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(cached, buf);
  }
  return buf;
}

function parsePNG(buf) {
  return PNG.sync.read(buf);
}

/** nearest-neighbour 리사이즈 */
function resize(src, size) {
  const dst = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = Math.floor(x * src.width  / size);
      const sy = Math.floor(y * src.height / size);
      const si = (sy * src.width  + sx) * 4;
      const di = (y  * size       + x)  * 4;
      dst.data[di]     = src.data[si];
      dst.data[di + 1] = src.data[si + 1];
      dst.data[di + 2] = src.data[si + 2];
      dst.data[di + 3] = src.data[si + 3];
    }
  }
  return dst;
}

/** hex → { r, g, b } 0-255 */
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

/**
 * potion.png + potion_overlay.png 합성
 * overlay 픽셀에 color 곱셈 tint → alpha 블렌딩
 */
function composite(base, overlay, color) {
  const { r: cr, g: cg, b: cb } = hexToRgb(color);
  const out = new PNG({ width: base.width, height: base.height });

  for (let i = 0; i < base.width * base.height; i++) {
    const bi = i * 4;

    // 베이스 픽셀
    let r = base.data[bi];
    let g = base.data[bi + 1];
    let b = base.data[bi + 2];
    let a = base.data[bi + 3];

    // overlay 픽셀 → tint 적용
    if (overlay) {
      const oa = overlay.data[bi + 3];
      if (oa > 0) {
        const or = Math.floor(overlay.data[bi]     * cr / 255);
        const og = Math.floor(overlay.data[bi + 1] * cg / 255);
        const ob = Math.floor(overlay.data[bi + 2] * cb / 255);

        // 스트레이트 알파 블렌드 (over 연산)
        const alpha = oa / 255;
        r = Math.round(or * alpha + r * (1 - alpha));
        g = Math.round(og * alpha + g * (1 - alpha));
        b = Math.round(ob * alpha + b * (1 - alpha));
        a = Math.round(oa + a * (1 - alpha));
      }
    }

    out.data[bi]     = r;
    out.data[bi + 1] = g;
    out.data[bi + 2] = b;
    out.data[bi + 3] = a;
  }
  return out;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const [baseBuf, overlayBuf] = await Promise.all([
    getAsset('potion'),
    getAsset('potion_overlay'),
  ]);

  if (!baseBuf) { console.error('potion.png 다운로드 실패'); process.exit(1); }

  const baseRaw    = parsePNG(baseBuf);
  const overlayRaw = overlayBuf ? parsePNG(overlayBuf) : null;

  console.log(`포션 아이콘 생성 중 (${POTION_COLORS.length}종)…`);

  for (const color of POTION_COLORS) {
    const hex  = color.replace('#', '').toUpperCase();
    const outPath = path.join(OUT_DIR, `potion_${hex}.png`);

    if (fs.existsSync(outPath)) {
      console.log(`  건너뜀: potion_${hex}.png`);
      continue;
    }

    const composited = composite(baseRaw, overlayRaw, color);
    const resized    = resize(composited, OUTPUT_SIZE);
    fs.writeFileSync(outPath, PNG.sync.write(resized));
    console.log(`  생성: potion_${hex}.png`);
  }

  console.log('완료!');
}

main().catch(e => { console.error(e); process.exit(1); });
