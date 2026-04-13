import { spawn } from 'node:child_process';
import process from 'node:process';
import waitOn from 'wait-on';

const workspaceRoot = new URL('../../../', import.meta.url);
const desktopRoot = new URL('../', import.meta.url);

const childProcesses = [];

function run(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env,
    stdio: 'inherit',
    shell: true,
  });
  childProcesses.push(child);
  return child;
}

function shutdown(code = 0) {
  for (const child of childProcesses) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

const vite = run('npm', ['run', 'dev', '-w', 'apps/client'], {
  cwd: workspaceRoot,
  env: process.env,
});

vite.on('exit', (code) => {
  if (code && code !== 0) {
    shutdown(code);
  }
});

await waitOn({
  resources: ['http://127.0.0.1:5173'],
  timeout: 120000,
});

const electron = run('npx', ['electron', '.'], {
  cwd: desktopRoot,
  env: {
    ...process.env,
    MDWRK_CLIENT_DEV_URL: 'http://127.0.0.1:5173',
  },
});

electron.on('exit', (code) => {
  shutdown(code ?? 0);
});
