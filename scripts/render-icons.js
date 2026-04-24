'use strict';

/**
 * Render Minecraft block icons for all supported versions.
 *
 * Blocks  → 64x64 3D rasterized PNG (top + south + east faces, creative-inventory angle)
 * Items   → flat sprite as-is from upstream texture assets
 *
 * Output: public/icons/{version}/{name}.png
 * Cache : .texture-cache/{textureVersion}/... (raw assets, skip re-download)
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');
const { PNG } = require('pngjs');
const md   = require('minecraft-data');

const { resolveModel } = require('./lib/model-parser');
const { renderBlock }  = require('./lib/renderer3d');

// ── Config ────────────────────────────────────────────────────────────────────

const VERSIONS = ['1.21.4', '1.20.4', '1.19.4', '1.18.2', '1.16.5', '1.12.2', '1.8.9'];

const TEXTURE_VERSION = {
  '1.21.4': '1.21.4', '1.20.4': '1.20.4', '1.19.4': '1.19.4',
  '1.18.2': '1.18.2', '1.16.5': '1.16.5', '1.12.2': '1.12.2', '1.8.9': '1.8',
};

const ROOT      = path.join(__dirname, '..');
const CACHE_DIR = path.join(ROOT, '.texture-cache');
const OUT_BASE  = path.join(ROOT, 'public', 'icons');

const OUTPUT_SIZE = 64; // final PNG size
const BATCH_SIZE  = 10;

// ── Network ───────────────────────────────────────────────────────────────────

/** Fetch URL → Buffer, or null on 404 */
async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 404) { res.resume(); resolve(null); return; }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/** Get asset from cache or download from minecraft-assets CDN */
async function getAsset(version, relPath) {
  const tv = TEXTURE_VERSION[version];
  const cached = path.join(CACHE_DIR, tv, relPath);
  if (fs.existsSync(cached)) return fs.readFileSync(cached);

  const url = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/${tv}/assets/minecraft/${relPath}`;
  const buf = await fetchUrl(url);
  if (buf) {
    fs.mkdirSync(path.dirname(cached), { recursive: true });
    fs.writeFileSync(cached, buf);
  }
  return buf; // null if 404
}

// ── Texture loading ───────────────────────────────────────────────────────────

/** Parse PNG buffer into pngjs object */
function parsePNG(buf) {
  return PNG.sync.read(buf);
}

/**
 * Load all textures referenced by elements.
 * @param {string}  version
 * @param {Array}   elements
 * @param {object}  texturePaths  { [key]: "block/stone" } (no leading #)
 * @returns {Promise<object>} { [key]: parsedPNG }
 */
async function loadTextures(version, elements, texturePaths) {
  // Collect all texture keys referenced in element faces
  const needed = new Set();
  for (const elem of elements) {
    for (const face of Object.values(elem.faces || {})) {
      let key = face.texture || '';
      while (key.startsWith('#')) key = key.slice(1);
      if (key) needed.add(key);
    }
  }

  const loaded = {};
  await Promise.all([...needed].map(async (key) => {
    const texPath = texturePaths[key];
    if (!texPath) return;
    // Strip namespace, build file path
    const p = texPath.replace(/^minecraft:/, '');
    const buf = await getAsset(version, `textures/${p}.png`);
    if (buf) {
      try { loaded[key] = parsePNG(buf); } catch { /* corrupt PNG, skip */ }
    }
  }));

  return loaded;
}

// ── Encode rendered RGBA to PNG buffer ────────────────────────────────────────

function encodeRGBA(rgba, width, height) {
  const png = new PNG({ width, height });
  png.data = Buffer.from(rgba);
  return PNG.sync.write(png);
}

// ── Flat sprite fallback ──────────────────────────────────────────────────────

/** Resize a flat sprite PNG to OUTPUT_SIZE×OUTPUT_SIZE (nearest neighbour) */
function resizeSprite(buf) {
  let src;
  try { src = parsePNG(buf); } catch { return buf; }
  if (src.width === OUTPUT_SIZE && src.height === OUTPUT_SIZE) return buf;
  const dst = new PNG({ width: OUTPUT_SIZE, height: OUTPUT_SIZE });
  for (let y = 0; y < OUTPUT_SIZE; y++) {
    for (let x = 0; x < OUTPUT_SIZE; x++) {
      const sx = Math.floor(x * src.width  / OUTPUT_SIZE);
      const sy = Math.floor(y * src.height / OUTPUT_SIZE);
      const si = (sy * src.width + sx) * 4;
      const di = (y  * OUTPUT_SIZE + x) * 4;
      dst.data[di]     = src.data[si];
      dst.data[di + 1] = src.data[si + 1];
      dst.data[di + 2] = src.data[si + 2];
      dst.data[di + 3] = src.data[si + 3];
    }
  }
  return PNG.sync.write(dst);
}

// ── Per-item render ───────────────────────────────────────────────────────────

async function renderItem(version, itemName) {
  // 1. Try block model → 3D render
  const model = await resolveModel(version, `block/${itemName}`,
    (v, p) => getAsset(v, p));

  if (model && model.elements && model.elements.length > 0) {
    const texs = await loadTextures(version, model.elements, model.textures);
    if (Object.keys(texs).length > 0) {
      const { rgba, width, height } = renderBlock(model.elements, texs, OUTPUT_SIZE);
      return encodeRGBA(rgba, width, height);
    }
  }

  // 2. Flat item sprite
  const itemBuf = await getAsset(version, `textures/item/${itemName}.png`);
  if (itemBuf) return resizeSprite(itemBuf);

  // 3. Flat block texture fallback
  const blockBuf = await getAsset(version, `textures/block/${itemName}.png`);
  if (blockBuf) return resizeSprite(blockBuf);

  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const stats = {};

  for (const version of VERSIONS) {
    const data  = md(version);
    const items = Object.values(data.itemsByName);
    const outDir = path.join(OUT_BASE, version);
    fs.mkdirSync(outDir, { recursive: true });

    console.log(`\n[${version}] 렌더링 ${items.length}개 아이템…`);

    let rendered = 0, skipped = 0, failed = 0;
    const failures = [];

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (item) => {
        const outPath = path.join(outDir, `${item.name}.png`);
        if (fs.existsSync(outPath)) { rendered++; return; }
        try {
          const png = await renderItem(version, item.name);
          if (png) {
            fs.writeFileSync(outPath, png);
            rendered++;
          } else {
            skipped++;
            failures.push(item.name);
          }
        } catch (err) {
          failed++;
          failures.push(`${item.name} (${err.message})`);
        }
      }));
      if (i > 0 && i % 100 === 0) {
        process.stdout.write(`  ${i}/${items.length} 완료\r`);
      }
    }

    console.log(`  완료: ${rendered} 렌더링, ${skipped} 스킵, ${failed} 실패`);
    if (failures.length > 0 && failures.length <= 20) {
      console.log(`  실패 목록: ${failures.join(', ')}`);
    } else if (failures.length > 20) {
      console.log(`  실패 목록 (처음 20개): ${failures.slice(0, 20).join(', ')}`);
    }
    stats[version] = { rendered, skipped, failed };
  }

  console.log('\n=== 완료 요약 ===');
  for (const [v, s] of Object.entries(stats)) {
    console.log(`  ${v}: ${s.rendered} 렌더링 / ${s.skipped} 스킵 / ${s.failed} 실패`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
