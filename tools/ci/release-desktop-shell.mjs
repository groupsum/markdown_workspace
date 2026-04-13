import { spawn } from 'node:child_process';

const target = process.env.MDWRK_SHELL_TARGET || 'desktop';
const command = target === 'android'
  ? ['run', 'android:release', '-w', 'apps/desktop']
  : ['run', 'dist', '-w', 'apps/desktop'];

const child = spawn('npm', command, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exitCode = code ?? 0;
});
