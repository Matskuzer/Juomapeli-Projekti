import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const server = spawn(process.execPath, [fileURLToPath(new URL('./server.mjs', import.meta.url))], { cwd: root, stdio: 'inherit' });
const vite = spawn(process.execPath, [fileURLToPath(new URL('./node_modules/vite/bin/vite.js', import.meta.url))], { cwd: root, stdio: 'inherit' });
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  server.kill();
  vite.kill();
  process.exitCode = code;
}

server.on('error', error => {
  console.error('Could not start the room API:', error.message);
  stop(1);
});
vite.on('error', error => {
  console.error('Could not start Vite:', error.message);
  stop(1);
});
server.on('exit', code => { if (!stopping) stop(code || 0); });
vite.on('exit', code => { if (!stopping) stop(code || 0); });
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
