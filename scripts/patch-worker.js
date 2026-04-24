const fs = require('fs');

const workerPath = '.open-next/worker.js';
let content = fs.readFileSync(workerPath, 'utf8');

const marker = '// - `Request`s are handled by the Next server';
const patch = `// Serve _next/ assets via ASSETS (renamed to next-static/ in deploy to avoid wrangler _ exclusion bug)
            if (url.pathname.startsWith('/_next/')) {
                const assetUrl = new URL(request.url);
                assetUrl.pathname = '/next-static' + assetUrl.pathname.substring(6);
                return env.ASSETS.fetch(assetUrl.toString());
            }
            `;

if (!content.includes(marker)) {
    console.error('ERROR: marker not found in worker.js');
    console.error('Content preview:', content.slice(0, 500));
    process.exit(1);
}

content = content.replace(marker, patch + marker);
fs.writeFileSync(workerPath, content);
console.log('worker.js patched successfully');
