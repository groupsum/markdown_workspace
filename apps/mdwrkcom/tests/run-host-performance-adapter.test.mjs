import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nginx = fs.readFileSync(path.join(appRoot, 'nginx.conf'), 'utf8');
const postDeploySmoke = fs.readFileSync(path.join(appRoot, 'scripts', 'post-deploy-smoke.mjs'), 'utf8');

assert.match(nginx, /gzip on;/);
assert.match(nginx, /gzip_vary on;/);
assert.match(nginx, /gzip_types[\s\S]*text\/css[\s\S]*application\/json[\s\S]*image\/svg\+xml;/);
assert.match(nginx, /location ~\* \^\/assets\/\.\+\\\.\[a-f0-9\]\{8,\}\\\.\(css\|js\|mjs\|png\|jpg\|jpeg\|webp\|svg\|ico\|woff2\?\)\$/);
assert.match(nginx, /Cache-Control "public, max-age=31536000, immutable"/);
assert.match(nginx, /critical-path-manifest\\\.json/);
assert.match(nginx, /location \/ \{[\s\S]*Cache-Control "no-cache"[\s\S]*try_files \$uri\/index\.html \$uri \/index\.html;/);

assert.match(postDeploySmoke, /Accept-Encoding': 'br, gzip'/);
assert.match(postDeploySmoke, /content-encoding/);
assert.match(postDeploySmoke, /br\|gzip/);
assert.match(postDeploySmoke, /immutable/);
assert.match(postDeploySmoke, /max-age=\(\?:\[3-9\]\\d\{6,\}\|\[1-9\]\\d\{7,\}\)/);
