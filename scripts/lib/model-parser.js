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

// ── Parent chain walker ───────────────────────────────────────────────────────

/**
 * Resolve a block model by walking the parent chain.
 * @param {string}   version    Minecraft version string (for getAsset key)
 * @param {string}   modelName  e.g. "block/stone" or "block/oak_stairs"
 * @param {Function} getAsset   async (version, relPath) => Buffer|null
 * @returns {Promise<{elements:Array, textures:object}|null>}
 *   null means caller should fall back to flat sprite
 */
async function resolveModel(version, modelName, getAsset) {
  // Normalize
  modelName = stripNs(modelName);
  if (!modelName.startsWith('block/') && !modelName.startsWith('item/')) {
    modelName = 'block/' + modelName;
  }

  // Item models → flat sprite (handled by caller)
  if (modelName.startsWith('item/')) return null;

  // Walk parent chain, collecting layers
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

  // Resolve #ref chains in texture values
  for (const k of Object.keys(mergedTextures)) {
    mergedTextures[k] = resolveRef(mergedTextures[k], mergedTextures);
  }
  // Second pass — some values may still be unresolved after one pass
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

  // No elements found → synthesize from merged textures
  if (!elements) {
    const synth = synthesizeFullCube(mergedTextures);
    if (!synth) return null;
    return synth;
  }

  // Resolve #ref texture references in element face definitions
  // (elements reference textures via "#key"; we keep them as-is and let
  //  the renderer strip the '#' when looking up in textures map)
  // However we DO need to resolve the texture values themselves:
  const finalTextures = {};
  for (const [k, v] of Object.entries(mergedTextures)) {
    if (v && !v.startsWith('#')) finalTextures[k] = v;
  }

  return { elements, textures: finalTextures };
}

module.exports = { resolveModel };
