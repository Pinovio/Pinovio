const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const EMAIL_FILE = path.join(DATA_DIR, 'emails.json');
const PUBLIC_DIR = __dirname;

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(EMAIL_FILE)) fs.writeFileSync(EMAIL_FILE, '[]', 'utf8');

const send = (res, status, body, headers = {}) => {
  const content = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    ...headers,
  });
  res.end(content);
};

const serveStatic = (req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host}`);
  let filePath = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
  filePath = path.join(PUBLIC_DIR, path.normalize(filePath.replace(/^\/+/, '')));

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    send(res, 403, { error: 'Forbidden' });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, { error: 'Not found' });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type =
      ext === '.html'
        ? 'text/html'
        : ext === '.css'
        ? 'text/css'
        : ext === '.js'
        ? 'text/javascript'
        : ext === '.txt'
        ? 'text/plain'
        : ext === '.xml'
        ? 'application/xml'
        : ext === '.png'
        ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
};

const handleSignup = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 1e6) req.connection.destroy();
  });

  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      const email = (data.email || '').trim().toLowerCase();
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        send(res, 400, { error: 'Invalid email' });
        return;
      }
      const existing = JSON.parse(fs.readFileSync(EMAIL_FILE, 'utf8'));
      if (!existing.find(e => e.email === email)) {
        existing.push({ email, addedAt: new Date().toISOString() });
        fs.writeFileSync(EMAIL_FILE, JSON.stringify(existing, null, 2));
      }
      send(res, 200, { success: true });
    } catch (err) {
      send(res, 500, { error: 'Server error' });
    }
  });
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (method === 'POST' && url === '/signup') {
    handleSignup(req, res);
    return;
  }

  if (method === 'GET') {
    serveStatic(req, res);
    return;
  }

  send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
