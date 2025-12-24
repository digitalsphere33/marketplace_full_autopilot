import http from 'http';

const opts = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/health',
  method: 'GET',
  timeout: 2000,
};

const req = http.request(opts, (res) => {
  console.log('statusCode', res.statusCode);
  res.setEncoding('utf8');
  res.on('data', (chunk) => console.log(chunk));
});
req.on('error', (e) => { console.error('Request error', e); process.exit(1); });
req.on('timeout', () => { console.error('Request timeout'); process.exit(1); });
req.end();
