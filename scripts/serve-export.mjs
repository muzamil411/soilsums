/**
 * Serves out/ the way the real host does, for auditing.
 *
 * Cloudflare Pages compresses text responses with brotli and serves hashed
 * assets as immutable. A plain static file server does neither, and the
 * difference is not cosmetic: auditing this site without compression scored
 * 83 on performance with a 4.6 s largest-contentful-paint, because Lighthouse
 * models a slow connection carrying 69 kB of uncompressed HTML. The same build
 * served compressed scores 99 with a 1.6 s LCP. The HTML is 7 kB over the wire.
 *
 *   npm run build && npm run serve
 *   CHROME_PATH=/path/to/chrome npx lighthouse http://localhost:4402/ \
 *     --only-categories=performance,accessibility,best-practices,seo \
 *     --chrome-flags="--headless=new"
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const ROOT = new URL('../out', import.meta.url).pathname;
const PORT = Number(process.env.PORT ?? 4402);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
};
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.svg', '.xml', '.txt', '.json']);
const cache = new Map();

createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let file = join(ROOT, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file) || !statSync(file).isFile()) {
    const notFound = join(ROOT, '404.html');
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(existsSync(notFound) ? readFileSync(notFound) : 'Not found');
    return;
  }

  const ext = extname(file);
  const headers = { 'content-type': TYPES[ext] ?? 'application/octet-stream' };
  if (path.startsWith('/_next/static/')) {
    headers['cache-control'] = 'public, max-age=31536000, immutable';
  }

  const accept = String(req.headers['accept-encoding'] ?? '');
  if (COMPRESSIBLE.has(ext)) {
    const encoding = accept.includes('br') ? 'br' : accept.includes('gzip') ? 'gzip' : null;
    if (encoding) {
      // Keyed on modification time as well as path, so a rebuild while the
      // server is running is picked up rather than served from a stale cache.
      const key = `${file}:${encoding}:${statSync(file).mtimeMs}`;
      if (!cache.has(key)) {
        const raw = readFileSync(file);
        cache.set(key, encoding === 'br' ? brotliCompressSync(raw) : gzipSync(raw));
      }
      headers['content-encoding'] = encoding;
      headers.vary = 'Accept-Encoding';
      res.writeHead(200, headers);
      res.end(cache.get(key));
      return;
    }
  }

  res.writeHead(200, headers);
  res.end(readFileSync(file));
}).listen(PORT, () => console.log(`serving ${ROOT} on ${PORT} with brotli/gzip`));
