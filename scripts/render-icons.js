'use strict';

/**
 * Render Minecraft item icons for all supported versions.
 *
 * Blocks  → 32x32 isometric 3-face PNG  (top + left + right)
 * Items   → flat sprite as-is from upstream texture assets
 *
 * Output: public/icons/{version}/{name}.png
 * Cache : .texture-cache/{textureVersion}/... (raw assets, skip re-download)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const md = require('minecraft-data');
const { readTexture, renderIsometric } = require('./lib/iso-render');

const VERSIONS = ['1.21.4', '1.20.4', '1.19.4', '1.18.2', '1.16.5', '1.12.2', '1.8.9'];

const TEXTURE_VERSION = {
  '1.21.4': '1.21.4', '1.20.4': '1.20.4', '1.19.4': '1.19.4',
  '1.18.2': '1.18.2', '1.16.5': '1.16.5', '1.12.2': '1.12.2', '1.8.9': '1.8',
};

const ROOT = path.join(__dirname, '..');
const CACHE_DIR = path.join(ROOT, '.texture-cache');
const OUT_BASE = path.join(ROOT, 'public', 'icons');

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
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/** Get asset from cache or download from minecraft-assets CDN */
async function getAsset(version, relPath) {
  const cached = path.join(CACHE_DIR, TEXTURE_VERSION[version], relPath);
  if (fs.existsSync(cached)) return fs.readFileSync(cached);

  const tv = TEXTURE_VERSION[version];
  const url = `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/${tv}/assets/minecraft/${relPath}`;
  const buf = await fetchUrl(url);
  if (buf) {
    fs.mkdirSync(path.dirname(cached), { recursive: true });
    fs.writeFileSync(cached, buf);
  }
  return buf; // null if 404
}

// ── Model resolution ──────────────────────────────────────────────────────────

/** Resolve block model → texture paths via parent-chain traversal */
async function resolveModel(version, modelName) {
  modelName = modelName.replace(/^minecraft:/, '');
  if (!modelName.startsWith('block/') && !modelName.startsWith('item/')) {
    modelName = 'block/' + modelName;
  }

  const textures = {};
  let current = modelName;

  for (let depth = 0; depth < 10 && current; depth++) {
    const buf = await getAsset(version, `models/${current}.json`);
    if (!buf) break;
    const model = JSON.parse(buf.toString());
    if (model.textures) {
      for (const [k, v] of Object.entries(model.textures)) {
        if (textures[k] === undefined) textures[k] = v;
      }
    }
    current = model.parent ? model.parent.replace(/^minecraft:/, '') : null;
  }

  // Resolve '#ref' chains
  const resolve = (v) => {
    for (let i = 0; i < 5 && v && v.startsWith('#'); i++) {
      v = textures[v.slice(1)];
    }
    return v;
  };
  for (const k of Object.keys(textures)) textures[k] = resolve(textures[k]);

  return textures;
}

/** Strip 'minecraft:' and ensure path has no leading slash */
function texPath(raw) {
  return raw ? raw.replace(/^minecraft:/, '') : null;
}

// ── Per-item render ───────────────────────────────────────────────────────────

async function renderItem(version, itemName) {
  // 1. Try block model (isometric render)
  const textures = await resolveModel(version, `block/${itemName}`);
  const topRaw = textures.up ?? textures.end ?? textures.all ?? textures.top ?? null;
  const sideRaw = textures.side ?? textures.north ?? textures.all ?? null;

  if (topRaw && sideRaw) {
    const topBuf = await getAsset(version, `textures/${texPath(topRaw)}.png`);
    const sideBuf = await getAsset(version, `textures/${texPath(sideRaw)}.png`);
    if (topBuf && sideBuf) {
      return renderIsometric(readTexture(topBuf), readTexture(sideBuf));
    }
    // Single-texture block (all faces same)
    if (topBuf) {
      const tex = readTexture(topBuf);
      return renderIsometric(tex, tex);
    }
  }

  // 2. Flat item sprite
  const itemBuf = await getAsset(version, `textures/item/${itemName}.png`);
  if (itemBuf) return itemBuf;

  // 3. Flat block texture fallback
  const blockBuf = await getAsset(version, `textures/block/${itemName}.png`);
  if (blockBuf) return blockBuf;

  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  for (const version of VERSIONS) {
    const data = md(version);
    const items = Object.values(data.itemsByName);
    const outDir = path.join(OUT_BASE, version);
    fs.mkdirSync(outDir, { recursive: true });

    console.log(`\n[${version}] Rendering ${items.length} items…`);
    let rendered = 0;
    let skipped = 0;

    const BATCH = 10;
    for (let i = 0; i < items.length; i += BATCH) {
      const batch = items.slice(i, i + BATCH);
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
          }
        } catch {
          skipped++;
        }
      }));
      if (i % 100 === 0 && i > 0) {
        process.stdout.write(`  ${i}/${items.length} done\r`);
      }
    }
    console.log(`  Done: ${rendered} rendered, ${skipped} skipped`);
  }
  console.log('\nAll versions complete.');
}

main().catch((e) => { console.error(e); process.exit(1); });
