import { spawn } from 'node:child_process';

const target = process.env.MDWRK_SHELL_TARGET || 'desktop';
const platform = process.env.MDWRK_SHELL_PLATFORM || '';

const desktopCommandByPlatform = {
  windows: ['run', 'dist:win', '-w', 'apps/desktop'],
  linux: ['run', 'dist:linux', '-w', 'apps/desktop'],
  darwin: ['run', 'dist:mac', '-w', 'apps/desktop'],
};

const command = target === 'android'
  ? ['run', 'android:release', '-w', 'apps/desktop']
  : desktopCommandByPlatform[platform] ?? ['run', 'dist', '-w', 'apps/desktop'];

const child = spawn('npm', command, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exitCode = code ?? 0;
});
