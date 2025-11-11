/**
 * Simple HTTP server to serve the React client with SPA routing
 * Uses only Node.js built-in modules (no external dependencies)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'client', 'dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
  // Decode URL and prevent directory traversal attacks
  let filePath = path.join(DIST_DIR, decodeURIComponent(req.url));

  // Resolve to index.html if it's a directory or file not found (SPA routing)
  if (!filePath.includes('.')) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  // Ensure the file is within DIST_DIR (security)
  const realPath = path.resolve(filePath);
  if (!realPath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(realPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // File not found, serve index.html for SPA routing
      fs.readFile(path.join(DIST_DIR, 'index.html'), (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
      return;
    }

    // Get file extension
    const ext = path.extname(realPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Read and serve the file
    fs.readFile(realPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Client server running on port ${PORT}`);
  console.log(`Serving files from ${DIST_DIR}`);
});
