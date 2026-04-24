const fs = require('fs');

const workerPath = '.open-next/worker.js';
let content = fs.readFileSync(workerPath, 'utf8');

const marker = '// - `Request`s are handled by the Next server';
const patch = `// Serve static assets directly via ASSETS binding
            if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/_next/data/')) {
                return env.ASSETS.fetch(request);
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
