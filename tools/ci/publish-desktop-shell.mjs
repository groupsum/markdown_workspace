import { spawn } from 'node:child_process';

const target = process.env.MDWRK_SHELL_TARGET || 'desktop';
const platform = process.env.MDWRK_SHELL_PLATFORM || '';

const desktopCommandByPlatform = {
  windows: ['run', 'publish:win', '-w', 'apps/desktop'],
  linux: ['run', 'publish:linux', '-w', 'apps/desktop'],
  darwin: ['run', 'publish:mac', '-w', 'apps/desktop'],
};

const command = target === 'android'
  ? ['run', 'android:release', '-w', 'apps/desktop']
  : desktopCommandByPlatform[platform] ?? ['run', 'publish', '-w', 'apps/desktop'];

const child = spawn('npm', command, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exitCode = code ?? 0;
});
