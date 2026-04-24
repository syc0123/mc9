/**
 * Isometric block renderer utilities.
 * Output: 32x32 PNG with three visible faces (top, left, right).
 *
 * Coordinate system (32x32 canvas):
 *   TOP vertices  : (16,0), (32,8), (16,16), (0,8)
 *   LEFT vertices : (0,8), (16,16), (16,32), (0,24)
 *   RIGHT vertices: (16,16), (32,8), (32,24), (16,32)
 */

'use strict';

const { PNG } = require('pngjs');

// ── UV mapping ────────────────────────────────────────────────────────────────

/** @returns {[number,number]|null} texture [u,v] for output pixel (x,y) on TOP face */
function topFaceUV(x, y) {
  // Diamond apex at (16, 0), basis +U → (+16, +8), +V → (−16, +8).
  const dx = x - 16;
  const dy = y;
  const u = Math.floor((dx + dy * 2) / 2);
  const v = Math.floor((-dx + dy * 2) / 2);
  if (u < 0 || u >= 16 || v < 0 || v >= 16) return null;
  return [u, v];
}

/** @returns {[number,number]|null} texture [u,v] for output pixel (x,y) on LEFT face */
function leftFaceUV(x, y) {
  const u = x;
  const v = Math.floor(y - 8 - x / 2);
  if (u < 0 || u >= 16 || v < 0 || v >= 16) return null;
  return [u, v];
}

/** @returns {[number,number]|null} texture [u,v] for output pixel (x,y) on RIGHT face */
function rightFaceUV(x, y) {
  const u = x - 16;
  const v = Math.floor(y - 16 + (x - 16) / 2);
  if (u < 0 || u >= 16 || v < 0 || v >= 16) return null;
  return [u, v];
}

// ── Texture helpers ───────────────────────────────────────────────────────────

/** Parse PNG buffer into {width, height, data} */
function readTexture(buf) {
  return PNG.sync.read(buf);
}

/** Sample RGBA from texture at logical [u,v] in [0,16) space */
function sampleTexel(tex, u, v) {
  const tu = Math.min(Math.floor((u * tex.width) / 16), tex.width - 1);
  const tv = Math.min(Math.floor((v * tex.height) / 16), tex.height - 1);
  const idx = (tv * tex.width + tu) * 4;
  return [tex.data[idx], tex.data[idx + 1], tex.data[idx + 2], tex.data[idx + 3]];
}

/** Apply brightness tint to RGBA */
function applyTint(rgba, factor) {
  return [
    Math.round(rgba[0] * factor),
    Math.round(rgba[1] * factor),
    Math.round(rgba[2] * factor),
    rgba[3],
  ];
}

// ── Renderer ──────────────────────────────────────────────────────────────────

/**
 * Render a 32x32 isometric block icon.
 * @param {object} topTex  - parsed PNG for the top face
 * @param {object} sideTex - parsed PNG for side faces (left & right)
 * @returns {Buffer} PNG file buffer
 */
function renderIsometric(topTex, sideTex) {
  const out = new PNG({ width: 32, height: 32 });
  out.data.fill(0); // fully transparent

  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      let color = null;

      // Priority: TOP > RIGHT > LEFT (painter's order matches visual layering)
      const uvTop = topFaceUV(x, y);
      if (uvTop && topTex) {
        color = applyTint(sampleTexel(topTex, uvTop[0], uvTop[1]), 1.0);
      }

      if (!color) {
        const uvRight = rightFaceUV(x, y);
        if (uvRight && sideTex) {
          color = applyTint(sampleTexel(sideTex, uvRight[0], uvRight[1]), 0.85);
        }
      }

      if (!color) {
        const uvLeft = leftFaceUV(x, y);
        if (uvLeft && sideTex) {
          color = applyTint(sampleTexel(sideTex, uvLeft[0], uvLeft[1]), 0.70);
        }
      }

      if (color && color[3] > 0) {
        const idx = (y * 32 + x) * 4;
        out.data[idx] = color[0];
        out.data[idx + 1] = color[1];
        out.data[idx + 2] = color[2];
        out.data[idx + 3] = color[3];
      }
    }
  }

  return PNG.sync.write(out);
}

module.exports = { readTexture, renderIsometric };
