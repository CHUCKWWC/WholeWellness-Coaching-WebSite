const http = require('http');
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.end('OK');
});
server.listen(process.env.PORT || 5000, '0.0.0.0');
process.on('SIGTERM', () => server.close(() => process.exit(0)));