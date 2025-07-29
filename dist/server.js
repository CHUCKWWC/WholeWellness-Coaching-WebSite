
const { spawn } = require('child_process');

const port = process.env.PORT || 5000;
console.log('Starting production server on port', port);

const server = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: port
  }
});

server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log('Server process exited with code', code);
  process.exit(code);
});
