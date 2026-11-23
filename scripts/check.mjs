import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { createServer } from 'node:net';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const ok = (message) => console.log(`✓ ${message}`);
const fail = (message) => { throw new Error(message); };

function run(command, args, label) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', shell: process.platform === 'win32', stdio: 'pipe' });
  if (result.error || result.status !== 0) {
    fail(`${label} failed.\n${result.stderr || result.stdout || result.error?.message || 'Unknown error'}`);
  }
  return (result.stdout || '').trim();
}

async function freePort() {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await new Promise((res, rej) => { server.once('listening', res); server.once('error', rej); });
  const port = server.address().port;
  await new Promise((res) => server.close(res));
  return port;
}

let preview;
try {
  const major = Number(process.versions.node.split('.')[0]);
  if (major !== 26) fail(`Node.js 26.x is required; found ${process.version}. Install Node.js 26 and retry.`);
  ok('Node.js 26.x');
  run(npm, ['--version'], 'npm');
  ok('npm available');
  run('git', ['--version'], 'Git');
  ok('Git available');
  const editor = spawnSync('code', ['--version'], { encoding: 'utf8', shell: process.platform === 'win32' });
  if (editor.status !== 0) console.log('i VS Code CLI not found (advisory only; open VS Code manually)');

  if (!existsSync(resolve(root, 'node_modules', 'vite')) || !existsSync(resolve(root, 'node_modules', 'react'))) {
    console.log('i Installing dependencies (first run can take a few minutes)...');
    run(npm, [existsSync(resolve(root, 'package-lock.json')) ? 'ci' : 'install', '--no-audit', '--no-fund'], 'npm dependency installation');
  }
  ok('npm dependencies installed');
  const [{ version: reactVersion }, { version: domVersion }, { version: tsVersion }, { version: viteVersion }] = await Promise.all([
    import('react/package.json', { with: { type: 'json' } }),
    import('react-dom/package.json', { with: { type: 'json' } }),
    import('typescript/package.json', { with: { type: 'json' } }),
    import('vite/package.json', { with: { type: 'json' } }),
  ]).then((modules) => modules.map((module) => module.default));
  if (![reactVersion, domVersion, tsVersion, viteVersion].every(Boolean)) fail('Missing a required project dependency.');
  if (!reactVersion.startsWith('19.') || !domVersion.startsWith('19.')) fail('Expected React and React DOM 19.x.');
  ok('React / React DOM / TypeScript / Vite available');

  run(npm, ['run', 'build'], 'TypeScript + Vite production build');
  ok('TypeScript compilation and Vite production build');

  const [{ createElement }, { renderToStaticMarkup }] = await Promise.all([
    import('react'), import('react-dom/server')
  ]);
  const { createServer: createViteServer } = await import('vite');
  // Short-lived SSR server: skip client dependency discovery so closing it doesn't abort an in-flight scan.
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { default: App } = await vite.ssrLoadModule('/src/App.tsx');
    const html = renderToStaticMarkup(createElement(App));
    if (!html.includes('data-testid="react-ready"') || !html.includes('React is ready.')) {
      fail('React component render did not produce the expected markup.');
    }
  } finally {
    await vite.close();
  }
  ok('React component renders successfully');

  const port = await freePort();
  preview = spawn(npm, ['run', 'preview', '--', '--port', String(port), '--strictPort'], {
    cwd: root,
    shell: process.platform === 'win32',
    stdio: 'ignore',
    windowsHide: true,
  });
  let success = false;
  for (let i = 0; i < 40; i++) {
    if (preview.exitCode !== null) break;
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1000) });
      const html = await response.text();
      if (response.ok && html.includes('<div id="root"></div>') && html.includes('/assets/')) {
        success = true;
        break;
      }
    } catch { /* server still starting */ }
    await delay(250);
  }
  if (!success) fail('Local Vite preview did not return the expected HTML. Check loopback networking.');
  ok('Local HTTP preview responds');
  console.log('\n✓ READY FOR INTERVIEW');
} catch (error) {
  console.error(`\n✗ PRECHECK FAILED: ${error.message}`);
  console.error('See docs/TROUBLESHOOTING.md for help.');
  process.exitCode = 1;
} finally {
  if (preview && preview.exitCode === null) {
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(preview.pid), '/T', '/F'], { stdio: 'ignore' });
    else preview.kill('SIGTERM');
  }
}
