'use strict';

/**
 * Pure-JS textured triangle rasterizer for Minecraft block icons.
 * No native dependencies. Renders elements[] from block model JSON.
 *
 * Pipeline:
 *   renderBlock(elements, textures, resolution)
 *     → renders at resolution*4 (SSAA)
 *     → downsample4x()
 *     → returns { rgba, width, height }
 */

// ── Math utilities ────────────────────────────────────────────────────────────

/** 3-component vector operations (plain objects, no class overhead) */
function vec3(x, y, z) { return { x, y, z }; }

function v3sub(a, b) { return vec3(a.x - b.x, a.y - b.y, a.z - b.z); }
function v3cross(a, b) {
  return vec3(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x,
  );
}
function v3dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
function v3len(a) { return Math.sqrt(v3dot(a, a)); }
function v3norm(a) { const l = v3len(a) || 1; return vec3(a.x / l, a.y / l, a.z / l); }

// ── Camera / projection ───────────────────────────────────────────────────────

const DEG = Math.PI / 180;
const ROT_Y = 45 * DEG;   // rotate scene around Y axis
const ROT_X = 30 * DEG;   // then tilt down around X axis

const CY = Math.cos(ROT_Y), SY = Math.sin(ROT_Y);
const CX = Math.cos(ROT_X), SX = Math.sin(ROT_X);

/**
 * Transform a model-space point into screen-space {sx, sy, sz}.
 * Model space: 0..16 cube. Center is at (8,8,8).
 * @param {number} wx @param {number} wy @param {number} wz
 * @param {number} scale pixels-per-unit
 * @param {number} cx screen centre X
 * @param {number} cy screen centre Y
 */
function project(wx, wy, wz, scale, cx, cy) {
  // 1. Centre at origin
  let x = wx - 8, y = wy - 8, z = wz - 8;
  // 2. Rotate Y by 45°
  const x2 = x * CY + z * SY;
  const z2 = -x * SY + z * CY;
  x = x2; z = z2;
  // 3. Rotate X by 30°
  const y3 = y * CX - z * SX;
  const z3 = y * SX + z * CX;
  y = y3; z = z3;
  // 4. Orthographic project (flip Y for screen coords)
  return { sx: x * scale + cx, sy: -y * scale + cy, sz: z };
}

// ── Face lighting (vanilla baked values) ──────────────────────────────────────

const FACE_LIGHT = { up: 1.0, down: 0.5, north: 0.8, south: 0.8, east: 0.6, west: 0.6 };

// ── Rasterizer ────────────────────────────────────────────────────────────────

/**
 * Rasterize one triangle into pixels[] and zbuffer[].
 * @param {Uint8Array}  pixels   RGBA flat array, width*height*4
 * @param {Float32Array} zbuffer width*height
 * @param {number} W canvas width
 * @param {number} H canvas height
 * @param {object} v0 {sx,sy,sz,u,v}
 * @param {object} v1
 * @param {object} v2
 * @param {object} tex pngjs parsed PNG {data,width,height}
 * @param {number} tint brightness multiplier 0..1
 */
function rasterizeTriangle(pixels, zbuffer, W, H, v0, v1, v2, tex, tint) {
  // Bounding box (clamped to canvas)
  const minX = Math.max(0, Math.floor(Math.min(v0.sx, v1.sx, v2.sx)));
  const maxX = Math.min(W - 1, Math.ceil(Math.max(v0.sx, v1.sx, v2.sx)));
  const minY = Math.max(0, Math.floor(Math.min(v0.sy, v1.sy, v2.sy)));
  const maxY = Math.min(H - 1, Math.ceil(Math.max(v0.sy, v1.sy, v2.sy)));

  if (minX > maxX || minY > maxY) return;

  // Edge function denominator for barycentric coords
  const denom = (v1.sy - v2.sy) * (v0.sx - v2.sx) + (v2.sx - v1.sx) * (v0.sy - v2.sy);
  if (Math.abs(denom) < 1e-8) return; // degenerate

  const invDenom = 1 / denom;

  const tw = tex.width, th = tex.height;

  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      // Barycentric weights
      const w0 = ((v1.sy - v2.sy) * (px - v2.sx) + (v2.sx - v1.sx) * (py - v2.sy)) * invDenom;
      const w1 = ((v2.sy - v0.sy) * (px - v2.sx) + (v0.sx - v2.sx) * (py - v2.sy)) * invDenom;
      const w2 = 1 - w0 - w1;
      if (w0 < -1e-5 || w1 < -1e-5 || w2 < -1e-5) continue;

      // Depth test
      const sz = w0 * v0.sz + w1 * v1.sz + w2 * v2.sz;
      const pidx = py * W + px;
      if (sz <= zbuffer[pidx]) continue;
      zbuffer[pidx] = sz;

      // Interpolate UV
      const u = w0 * v0.u + w1 * v1.u + w2 * v2.u;
      const v = w0 * v0.v + w1 * v1.v + w2 * v2.v;

      // Sample texture
      const tu = Math.min(Math.floor(u * tw), tw - 1);
      const tv = Math.min(Math.floor(v * th), th - 1);
      const tidx = (tv * tw + tu) * 4;
      const r = tex.data[tidx];
      const g = tex.data[tidx + 1];
      const b = tex.data[tidx + 2];
      const a = tex.data[tidx + 3];
      if (a === 0) continue; // fully transparent texel

      const pout = pidx * 4;
      pixels[pout]     = Math.min(255, Math.round(r * tint));
      pixels[pout + 1] = Math.min(255, Math.round(g * tint));
      pixels[pout + 2] = Math.min(255, Math.round(b * tint));
      pixels[pout + 3] = a;
    }
  }
}

// ── UV helpers ────────────────────────────────────────────────────────────────

/**
 * Rotate UV coordinates by Minecraft face rotation (0/90/180/270 degrees).
 * Minecraft rotates UV clockwise by `rot` degrees.
 * @param {number} u 0..1
 * @param {number} v 0..1
 * @param {number} rot degrees (0/90/180/270)
 */
function rotateUV(u, v, rot) {
  switch ((rot || 0) % 360) {
    case 90:  return [1 - v, u];
    case 180: return [1 - u, 1 - v];
    case 270: return [v, 1 - u];
    default:  return [u, v];
  }
}

/**
 * Build UV coordinates for a face quad using face.uv (0..16 space).
 * Returns four {u,v} corner objects in order: TL, TR, BR, BL
 * (matches the quad triangulation order below).
 *
 * Minecraft UV convention: [u1,v1,u2,v2] where (u1,v1)=top-left, (u2,v2)=bottom-right
 * in texture space (V increases downward).
 */
function buildFaceUVs(faceUV, faceRotation) {
  const [u1, v1, u2, v2] = faceUV.map(x => x / 16);
  // Four corners of the UV quad (TL, TR, BR, BL)
  let corners = [
    { u: u1, v: v1 },
    { u: u2, v: v1 },
    { u: u2, v: v2 },
    { u: u1, v: v2 },
  ];
  if (faceRotation) {
    corners = corners.map(c => {
      const [ru, rv] = rotateUV(c.u, c.v, faceRotation);
      return { u: ru, v: rv };
    });
  }
  return corners;
}

/**
 * Derive default UV from element extents for a given face direction.
 * Returns [u1,v1,u2,v2] in 0..16 space.
 */
function defaultUV(face, from, to) {
  switch (face) {
    case 'up':
    case 'down':  return [from[0], from[2], to[0], to[2]];
    case 'north': return [16 - to[0], 16 - to[1], 16 - from[0], 16 - from[1]];
    case 'south': return [from[0], 16 - to[1], to[0], 16 - from[1]];
    case 'west':  return [from[2], 16 - to[1], to[2], 16 - from[1]];
    case 'east':  return [16 - to[2], 16 - to[1], 16 - from[2], 16 - from[1]];
    default:      return [0, 0, 16, 16];
  }
}

// ── Element rotation ──────────────────────────────────────────────────────────

/**
 * Apply element rotation (if any) to a world-space point.
 * @param {number[]} p [x,y,z]
 * @param {object}  rot {origin:[x,y,z], axis:'x'|'y'|'z', angle:number}
 */
function applyElementRotation(p, rot) {
  if (!rot) return p;
  const [ox, oy, oz] = rot.origin;
  const ang = rot.angle * DEG;
  const cos = Math.cos(ang), sin = Math.sin(ang);
  let x = p[0] - ox, y = p[1] - oy, z = p[2] - oz;
  switch (rot.axis) {
    case 'x': { const y2 = y * cos - z * sin; z = y * sin + z * cos; y = y2; break; }
    case 'y': { const x2 = x * cos + z * sin; z = -x * sin + z * cos; x = x2; break; }
    case 'z': { const x2 = x * cos - y * sin; y = x * sin + y * cos; x = x2; break; }
  }
  return [x + ox, y + oy, z + oz];
}

// ── Face geometry ─────────────────────────────────────────────────────────────

/**
 * Get the 4 corner points of a face in model space (0..16).
 * Returns [p0, p1, p2, p3] as [x,y,z] arrays in winding order:
 * TL, TR, BR, BL when viewed from outside the cube.
 */
function getFaceCorners(face, from, to) {
  const [fx, fy, fz] = from;
  const [tx, ty, tz] = to;
  switch (face) {
    case 'up':    return [[fx,ty,fz],[tx,ty,fz],[tx,ty,tz],[fx,ty,tz]];
    case 'down':  return [[fx,fy,tz],[tx,fy,tz],[tx,fy,fz],[fx,fy,fz]];
    case 'north': return [[tx,ty,fz],[fx,ty,fz],[fx,fy,fz],[tx,fy,fz]];
    case 'south': return [[fx,ty,tz],[tx,ty,tz],[tx,fy,tz],[fx,fy,tz]];
    case 'east':  return [[tx,ty,tz],[tx,ty,fz],[tx,fy,fz],[tx,fy,tz]];
    case 'west':  return [[fx,ty,fz],[fx,ty,tz],[fx,fy,tz],[fx,fy,fz]];
    default:      return [[fx,fy,fz],[tx,fy,fz],[tx,ty,fz],[fx,ty,fz]];
  }
}

// ── 4x SSAA downsample ────────────────────────────────────────────────────────

/**
 * Box-filter downsample by 4x.
 * @param {Uint8Array} rgba input buffer (W*H*4)
 * @param {number} W input width
 * @param {number} H input height
 * @returns {Uint8Array} output buffer (W/4 * H/4 * 4)
 */
function downsample4x(rgba, W, H) {
  const ow = W >> 2, oh = H >> 2;
  const out = new Uint8Array(ow * oh * 4);
  for (let oy = 0; oy < oh; oy++) {
    for (let ox = 0; ox < ow; ox++) {
      let r = 0, g = 0, b = 0, a = 0, totalA = 0;
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 4; dx++) {
          const idx = ((oy * 4 + dy) * W + (ox * 4 + dx)) * 4;
          const pa = rgba[idx + 3];
          a += pa;
          r += rgba[idx]     * pa;
          g += rgba[idx + 1] * pa;
          b += rgba[idx + 2] * pa;
          totalA += pa;
        }
      }
      const oidx = (oy * ow + ox) * 4;
      if (totalA > 0) {
        out[oidx]     = Math.round(r / totalA);
        out[oidx + 1] = Math.round(g / totalA);
        out[oidx + 2] = Math.round(b / totalA);
        out[oidx + 3] = Math.min(255, Math.round(a / 16));
      }
    }
  }
  return out;
}

// ── Main render entry point ───────────────────────────────────────────────────

/**
 * Render a block from its model elements.
 * @param {Array}  elements   array of element objects from model JSON
 * @param {object} textures   { [key]: parsedPNG } — key without leading '#'
 * @param {number} resolution target output size (renders at 4x internally)
 * @returns {{ rgba: Uint8Array, width: number, height: number }}
 */
function renderBlock(elements, textures, resolution) {
  const R = resolution * 4; // internal SSAA resolution
  const pixels = new Uint8Array(R * R * 4);
  const zbuffer = new Float32Array(R * R).fill(-Infinity);

  // Y(45°)+X(30°) rotation: 16-unit cube projects ~28 units tall; 0.85/28 ≈ 10% padding
  const scale = R * 0.85 / 28;
  const cx = R / 2, cy = R / 2;

  // Process elements back-to-front is not needed with z-buffer; iterate all
  for (const elem of elements) {
    const from = elem.from;
    const to   = elem.to;
    const faces = elem.faces || {};
    const elemRot = elem.rotation || null;

    const FACE_DIRS = ['up', 'down', 'north', 'south', 'east', 'west'];

    for (const faceName of FACE_DIRS) {
      const faceDef = faces[faceName];
      if (!faceDef) continue;

      // Resolve texture key
      let texKey = faceDef.texture || '';
      while (texKey.startsWith('#')) texKey = texKey.slice(1);
      const tex = textures[texKey];
      if (!tex) continue;

      // Get face UV
      const rawUV = faceDef.uv || defaultUV(faceName, from, to);
      const faceRot = faceDef.rotation || 0;
      const uvCorners = buildFaceUVs(rawUV, faceRot);

      // Get face corner world positions
      let corners = getFaceCorners(faceName, from, to);

      // Apply element rotation
      if (elemRot) {
        corners = corners.map(p => applyElementRotation(p, elemRot));
      }

      // Lighting tint
      const tint = FACE_LIGHT[faceName] ?? 0.7;

      // Project to screen: 4 corners → two triangles
      const sv = corners.map(([x, y, z]) => {
        const p = project(x, y, z, scale, cx, cy);
        return p;
      });

      // Assign UV corners to screen verts
      // Corners order: TL, TR, BR, BL → indices 0,1,2,3
      // Triangle 1: 0,1,2 | Triangle 2: 0,2,3
      const verts = sv.map((p, i) => ({
        sx: p.sx, sy: p.sy, sz: p.sz,
        u: uvCorners[i].u, v: uvCorners[i].v,
      }));

      rasterizeTriangle(pixels, zbuffer, R, R, verts[0], verts[1], verts[2], tex, tint);
      rasterizeTriangle(pixels, zbuffer, R, R, verts[0], verts[2], verts[3], tex, tint);
    }
  }

  const downsampled = downsample4x(pixels, R, R);
  return { rgba: downsampled, width: resolution, height: resolution };
}

module.exports = { renderBlock, downsample4x };
