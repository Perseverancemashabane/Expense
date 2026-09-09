const { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('====================================================');
console.log('🎓 Student Budget and Expense Tracker - Dev Server');
console.log('====================================================');

const serverDir = path.join(__dirname, 'server');
const clientDir = path.join(__dirname, 'client');

// Start Express Backend
console.log('📡 Starting Express Backend on port 5000...');
const serverProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: serverDir,
  shell: true,
  stdio: 'pipe',
  env: { ...process.env, PORT: '5000' },
});

serverProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[34m[SERVER]\x1b[0m ${data.toString()}`);
});

serverProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[SERVER ERR]\x1b[0m ${data.toString()}`);
});

// Start Next.js Frontend
console.log('💻 Starting Next.js Client on port 3000...');
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: clientDir,
  shell: true,
  stdio: 'pipe',
  env: { ...process.env, PORT: '3000' },
});

clientProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[CLIENT]\x1b[0m ${data.toString()}`);
});

clientProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[CLIENT MSG]\x1b[0m ${data.toString()}`);
});

// Clean termination handling
function cleanExit() {
  console.log('\n🛑 Shutting down dev servers...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
}

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

