'use strict';

/**
 * Resolve Minecraft block model JSON parent chain into flattened elements + textures.
 * Handles: parent chain traversal, texture #ref resolution, element inheritance,
 * and fallback synthesis for parentless cube models.
 */

const MAX_DEPTH = 10;

// ── Texture reference resolution ──────────────────────────────────────────────

/**
 * Resolve a texture value that may be a #ref chain.
 * @param {string} value e.g. "#all" or "minecraft:block/stone"
 * @param {object} map   accumulated texture map
 */
function resolveRef(value, map) {
  for (let i = 0; i < 8 && value && value.startsWith('#'); i++) {
    value = map[value.slice(1)];
  }
  return value || null;
}

/**
 * Strip "minecraft:" namespace prefix.
 */
function stripNs(v) {
  return v ? v.replace(/^minecraft:/, '') : v;
}

// ── Fallback element synthesis ────────────────────────────────────────────────

/**
 * Synthesize a full-cube element from available texture keys.
 * Used when a model has no elements[] (e.g. cube_all, cube_column resolved via parents).
 * @param {object} textures resolved texture map
 */
function synthesizeFullCube(textures) {
  const t = textures;

  // Pick best texture key for each face using vanilla conventions
  const up    = t.up    ?? t.end ?? t.top  ?? t.all ?? null;
  const down  = t.down  ?? t.end ?? t.bottom ?? t.all ?? null;
  const north = t.north ?? t.side ?? t.all ?? null;
  const south = t.south ?? t.side ?? t.all ?? null;
  const east  = t.east  ?? t.side ?? t.all ?? null;
  const west  = t.west  ?? t.side ?? t.all ?? null;

  // If no usable texture at all, return nothing
  if (!up && !north) return null;

  const faces = {};
  if (up)    faces.up    = { texture: '#up',    uv: [0, 0, 16, 16] };
  if (down)  faces.down  = { texture: '#down',  uv: [0, 0, 16, 16] };
  if (north) faces.north = { texture: '#north', uv: [0, 0, 16, 16] };
  if (south) faces.south = { texture: '#south', uv: [0, 0, 16, 16] };
  if (east)  faces.east  = { texture: '#east',  uv: [0, 0, 16, 16] };
  if (west)  faces.west  = { texture: '#west',  uv: [0, 0, 16, 16] };

  // Build a synthetic textures map with resolved values
  const syntheticTextures = {};
  if (up)    syntheticTextures.up    = up;
  if (down)  syntheticTextures.down  = down;
  if (north) syntheticTextures.north = north;
  if (south) syntheticTextures.south = south;
  if (east)  syntheticTextures.east  = east;
  if (west)  syntheticTextures.west  = west;

  return {
    elements: [{ from: [0, 0, 0], to: [16, 16, 16], faces }],
    textures: syntheticTextures,
  };
}

// ── Fallback synthesis helpers ─────────────────────────────────────────────────

/**
 * Synthesize a pillar box element with a single uniform texture on all faces.
 * UV is derived automatically from the box cross-section dimensions.
 * @param {number[]} from      [x1, y1, z1]
 * @param {number[]} to        [x2, y2, z2]
 * @param {string}   texPath   resolved texture path, e.g. "block/tuff"
 */
function synthesizePillarBox(from, to, texPath) {
  const [x1,,z1] = from;
  const [x2,,z2] = to;
  const faceUV = [x1, z1, x2, z2]; // cross-section UV for side faces
  const topUV  = [x1, z1, x2, z2];
  const FACES  = ['up', 'down', 'north', 'south', 'east', 'west'];
  const faces  = {};
  for (const f of FACES) {
    faces[f] = { texture: '#all', uv: f === 'up' || f === 'down' ? topUV : faceUV };
  }
  return { elements: [{ from, to, faces }], textures: { all: texPath } };
}

/** Synthesize a wall pillar (4,0,4)→(12,16,12). Wrapper around synthesizePillarBox. */
function synthesizeWallPillar(texturePath) {
  return synthesizePillarBox([4, 0, 4], [12, 16, 12], texturePath);
}

/**
 * Derive the base texture name for a _wall block.
 * e.g. tuff_wall → tuff, cobblestone_wall → cobblestone,
 *      tuff_brick_wall → tuff_bricks (tries with trailing 's' first).
 */
function wallBaseName(name) {
  // Remove trailing _wall
  const base = name.replace(/_wall$/, '');
  // For *_brick variants try plural form first, then singular
  if (base.endsWith('_brick')) return [base + 's', base];
  return [base];
}

/**
 * Map a _fence block name to candidate texture paths (ordered: best first).
 * nether_brick_fence → block/nether_bricks
 * oak_fence → block/oak_planks
 * crimson_fence / warped_fence → block/{wood}_planks
 */
function fenceTextureCandidates(name) {
  // nether_brick_fence is the only non-wood fence
  if (name === 'nether_brick_fence') return ['block/nether_bricks'];
  const wood = name.replace(/_fence$/, '');
  return [`block/${wood}_planks`, `block/${wood}`];
}

/**
 * Synthesize a thin glass-pane plate (7,0,0)→(9,16,16) standing along Z-axis.
 * Texture: for glass_pane → block/glass; {color}_stained_glass_pane → block/{color}_stained_glass.
 */
function glassPaneTexture(name) {
  if (name === 'glass_pane') return 'block/glass';
  // {color}_stained_glass_pane → block/{color}_stained_glass
  return 'block/' + name.replace(/_pane$/, '');
}

// ── Parent chain walker ───────────────────────────────────────────────────────

/**
 * Walk the parent chain and resolve merged textures + elements.
 * Returns null when the CDN has no model JSON for the given path.
 */
async function resolveModelChain(version, modelName, getAsset) {
  const layers = []; // [{textures, elements}] from child to root
  let current = modelName;

  for (let depth = 0; depth < MAX_DEPTH && current; depth++) {
    const buf = await getAsset(version, `models/${current}.json`);
    if (!buf) break;

    let model;
    try { model = JSON.parse(buf.toString()); } catch { break; }

    layers.push({
      textures: model.textures || {},
      elements: model.elements || null,
    });

    current = model.parent ? stripNs(model.parent) : null;
  }

  if (layers.length === 0) return null;

  // Merge textures: child wins over parent
  const mergedTextures = {};
  for (let i = layers.length - 1; i >= 0; i--) {
    for (const [k, v] of Object.entries(layers[i].textures)) {
      mergedTextures[k] = stripNs(v);
    }
  }

  // Resolve #ref chains in texture values (two passes for nested refs)
  for (const k of Object.keys(mergedTextures)) {
    mergedTextures[k] = resolveRef(mergedTextures[k], mergedTextures);
  }
  for (const k of Object.keys(mergedTextures)) {
    if (mergedTextures[k] && mergedTextures[k].startsWith('#')) {
      mergedTextures[k] = resolveRef(mergedTextures[k], mergedTextures);
    }
  }

  // Find elements: child's elements win; walk layers from child to root
  let elements = null;
  for (const layer of layers) {
    if (layer.elements) { elements = layer.elements; break; }
  }

  // No explicit elements → synthesize a full cube from merged textures
  if (!elements) {
    const synth = synthesizeFullCube(mergedTextures);
    if (!synth) return null;
    return synth;
  }

  const finalTextures = {};
  for (const [k, v] of Object.entries(mergedTextures)) {
    if (v && !v.startsWith('#')) finalTextures[k] = v;
  }

  return { elements, textures: finalTextures };
}

/**
 * Resolve a block model. Fallback order:
 *  1. parent-chain  2. _wall  3. waxed_  4. suspicious_
 *  5. infested_     6. _fence 7. _glass_pane 8. iron_bars/chain
 * Returns null → caller uses flat sprite.
 */
async function resolveModel(version, modelName, getAsset) {
  // Normalize
  modelName = stripNs(modelName);
  if (!modelName.startsWith('block/') && !modelName.startsWith('item/')) {
    modelName = 'block/' + modelName;
  }

  // Item models → flat sprite (handled by caller)
  if (modelName.startsWith('item/')) return null;

  // Step 1: normal parent-chain resolution
  const chain = await resolveModelChain(version, modelName, getAsset);
  if (chain) return chain;

  // Bare block name for suffix/prefix checks
  const blockName = modelName.replace(/^block\//, '');

  // Step 2: _wall synthesis
  if (blockName.endsWith('_wall')) {
    const candidates = wallBaseName(blockName);
    for (const base of candidates) {
      const texPath = `block/${base}`;
      const texBuf = await getAsset(version, `textures/${texPath}.png`);
      if (texBuf) return synthesizeWallPillar(texPath);
    }
    // No matching texture found; fall through
  }

  // Step 3: waxed_ → strip prefix and recurse (one level only)
  if (blockName.startsWith('waxed_')) {
    const unwaxed = 'block/' + blockName.replace(/^waxed_/, '');
    const unwaxedChain = await resolveModelChain(version, unwaxed, getAsset);
    if (unwaxedChain) return unwaxedChain;
  }

  // Step 4: suspicious_ → synthesize cube with frame-0 or base texture
  if (blockName.startsWith('suspicious_')) {
    const base = blockName.replace(/^suspicious_/, ''); // "sand" or "gravel"
    const frame0 = `block/${blockName}_0`;
    const frame0Buf = await getAsset(version, `textures/${frame0}.png`);
    if (frame0Buf) {
      return synthesizeFullCube({ all: frame0 }) ||
        synthesizeFullCube({ all: `block/${base}` });
    }
    // Fall back to plain base texture
    const baseBuf = await getAsset(version, `textures/block/${base}.png`);
    if (baseBuf) return synthesizeFullCube({ all: `block/${base}` });
  }

  // Step 5: infested_ → strip prefix and recurse (visually identical to base block)
  if (blockName.startsWith('infested_')) {
    const stripped = 'block/' + blockName.replace(/^infested_/, '');
    const strippedChain = await resolveModelChain(version, stripped, getAsset);
    if (strippedChain) return strippedChain;
  }

  // Step 6: _fence suffix (NOT _fence_gate) → fence pillar with planks texture
  if (blockName.endsWith('_fence') && !blockName.endsWith('_fence_gate')) {
    for (const texPath of fenceTextureCandidates(blockName)) {
      const buf = await getAsset(version, `textures/${texPath}.png`);
      if (buf) return synthesizePillarBox([6, 0, 6], [10, 16, 10], texPath);
    }
  }

  // Step 7: _stained_glass_pane or glass_pane → thin standing plate
  if (blockName.endsWith('_glass_pane') || blockName === 'glass_pane') {
    const texPath = glassPaneTexture(blockName);
    const buf = await getAsset(version, `textures/${texPath}.png`);
    if (buf) return synthesizePillarBox([7, 0, 0], [9, 16, 16], texPath);
  }

  // Step 8: iron_bars or chain → thin post pillar
  if (blockName === 'iron_bars' || blockName === 'chain') {
    const texPath = `block/${blockName}`;
    const buf = await getAsset(version, `textures/${texPath}.png`);
    if (buf) return synthesizePillarBox([6, 0, 6], [10, 16, 10], texPath);
  }

  return null;
}

module.exports = { resolveModel };
