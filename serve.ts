// Tiny static server for local play-testing only (not part of the entry).
// Serves game/ at http://localhost:8080 so the game can be played and
// screenshotted in a desktop browser. Run: node serve.ts

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'game');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

createServer((req, res) => {
  const path = join(root, req.url === '/' ? 'index.html' : decodeURIComponent(req.url).split('?')[0]);
  if (!path.startsWith(root) || !existsSync(path)) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
  res.end(readFileSync(path));
}).listen(8080, () => console.log('Rune Clash at http://localhost:8080'));
