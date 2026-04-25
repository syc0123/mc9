'use strict';

/**
 * Minecraft 텍스처/모델 에셋 취득 모듈.
 *
 * - 1.16.5 이상: Mojang 공식 에셋 서버 (resources.download.minecraft.net)
 * - 1.12.2, 1.8.9: 에셋 인덱스에 텍스처 없음 → GitHub 미러 폴백
 *
 * 캐시 구조: .texture-cache/{version}/{relPath}
 * 인덱스 캐시: .texture-cache/{version}/_index.json
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');

const MANIFEST_URL  = 'https://launchermeta.mojang.com/mc/game/version_manifest_v2.json';
const RESOURCE_BASE = 'https://resources.download.minecraft.net';
const GITHUB_BASE   = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets';

// Mojang 에셋 인덱스에 텍스처가 없는 레거시 버전 → GitHub 브랜치명 매핑
const LEGACY = {
  '1.8.9':  '1.8.9',
  '1.12.2': '1.12.2',
};

async function fetchBuf(url, hops = 5) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302) && hops > 0) {
        res.resume();
        fetchBuf(res.headers.location, hops - 1).then(resolve, reject);
        return;
      }
      if (res.statusCode === 404) { res.resume(); resolve(null); return; }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end',  () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

class MojangAssetFetcher {
  constructor(cacheDir) {
    this.cacheDir  = cacheDir;
    this._idx      = {};      // version → objects map
    this._legacy   = new Set(); // 텍스처가 인덱스에 없는 버전
  }

  async _loadIndex(version) {
    if (this._idx[version]) return this._idx[version];

    const idxFile = path.join(this.cacheDir, version, '_index.json');
    if (fs.existsSync(idxFile)) {
      const obj = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
      // 레거시 판별: 텍스처 엔트리 없음
      if (!Object.keys(obj).some(k => k.startsWith('minecraft/textures/'))) {
        this._legacy.add(version);
      }
      this._idx[version] = obj;
      return obj;
    }

    process.stdout.write(`  [Mojang] ${version} 에셋 인덱스 다운로드 중...\n`);

    const manifest = JSON.parse((await fetchBuf(MANIFEST_URL)).toString());
    const vMeta    = manifest.versions.find(v => v.id === version);
    if (!vMeta) throw new Error(`Mojang 매니페스트에 버전 ${version} 없음`);

    const clientJson = JSON.parse((await fetchBuf(vMeta.url)).toString());
    const idxJson    = JSON.parse((await fetchBuf(clientJson.assetIndex.url)).toString());

    fs.mkdirSync(path.dirname(idxFile), { recursive: true });
    fs.writeFileSync(idxFile, JSON.stringify(idxJson.objects));

    if (!Object.keys(idxJson.objects).some(k => k.startsWith('minecraft/textures/'))) {
      this._legacy.add(version);
      process.stdout.write(`  [legacy] ${version} → GitHub 미러 폴백 사용\n`);
    }

    this._idx[version] = idxJson.objects;
    return idxJson.objects;
  }

  async _githubFetch(version, relPath, cachePath) {
    const branch = LEGACY[version] || version;
    // Pre-1.13: textures/item → textures/items, textures/block → textures/blocks
    const legacyPath = relPath
      .replace(/^textures\/item\//, 'textures/items/')
      .replace(/^textures\/block\//, 'textures/blocks/');
    const url = `${GITHUB_BASE}/${branch}/assets/minecraft/${legacyPath}`;
    const buf = await fetchBuf(url);
    if (buf) {
      fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      fs.writeFileSync(cachePath, buf);
    }
    return buf;
  }

  /**
   * @param {string} version  Mojang 버전 ID (예: '1.21.4', '1.8.9')
   * @param {string} relPath  assets/minecraft/ 기준 경로 (예: 'textures/item/potion.png')
   * @returns {Promise<Buffer|null>}
   */
  async getAsset(version, relPath) {
    const cachePath = path.join(this.cacheDir, version, relPath);
    if (fs.existsSync(cachePath)) return fs.readFileSync(cachePath);

    await this._loadIndex(version);

    // 레거시 버전은 GitHub 미러에서 직접 취득
    if (this._legacy.has(version)) {
      return this._githubFetch(version, relPath, cachePath);
    }

    const obj = this._idx[version][`minecraft/${relPath}`];
    if (!obj) return null;

    const { hash } = obj;
    const buf = await fetchBuf(`${RESOURCE_BASE}/${hash.slice(0, 2)}/${hash}`);
    if (buf) {
      fs.mkdirSync(path.dirname(cachePath), { recursive: true });
      fs.writeFileSync(cachePath, buf);
    }
    return buf;
  }
}

module.exports = { MojangAssetFetcher };
