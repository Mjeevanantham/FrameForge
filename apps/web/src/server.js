import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RENDER_PRESETS } from '../../../packages/shared/src/index.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const port = Number(process.env.PORT ?? 3000);

async function readLogo() {
  return readFile(resolve(repoRoot, 'assets/brand/logo.svg'), 'utf8');
}

function renderHome(logoSvg) {
  const presets = Object.values(RENDER_PRESETS)
    .map((preset) => `<li><strong>${preset.id}</strong>: ${preset.width}×${preset.height} @ ${preset.fps}fps for ${preset.durationSeconds}s</li>`)
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FrameForge</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    body { margin: 0; background: #03050b; color: #f7f7fb; }
    main { max-width: 980px; margin: 0 auto; padding: 48px 24px; }
    .logo { max-width: 360px; margin: 0 auto 32px; }
    .logo svg { width: 100%; height: auto; display: block; }
    .card { border: 1px solid #27324a; border-radius: 24px; padding: 28px; background: rgba(8, 13, 28, 0.86); box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35); }
    h1 { font-size: clamp(2.4rem, 6vw, 5rem); margin: 0; letter-spacing: -0.06em; }
    p { color: #c9d2ea; font-size: 1.1rem; line-height: 1.7; }
    code { color: #5ee9ff; }
  </style>
</head>
<body>
  <main>
    <div class="logo">${logoSvg}</div>
    <section class="card">
      <h1>HTML to production-quality video.</h1>
      <p>FrameForge is being built as a deterministic renderer for Claude, React, and HTML animations. The MVP pipeline will accept uploads, enqueue render jobs, capture browser frames, and encode MP4 output.</p>
      <h2>Available presets</h2>
      <ul>${presets}</ul>
      <p>Worker smoke test: <code>npm run render:sample</code></p>
    </section>
  </main>
</body>
</html>`;
}

const server = createServer(async (request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ok: true, service: 'frameforge-web' }));
    return;
  }

  if (request.url === '/' || request.url === '/index.html') {
    const logoSvg = await readLogo();
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderHome(logoSvg));
    return;
  }

  response.writeHead(404, { 'content-type': 'application/json' });
  response.end(JSON.stringify({ error: 'not_found' }));
});

server.listen(port, () => {
  console.log(`FrameForge web listening on http://localhost:${port}`);
});
