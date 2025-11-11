/**
 * Simple HTTP server to serve the React client with SPA routing
 * Uses only Node.js built-in modules (no external dependencies)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'client', 'dist');

console.log(`Starting client server on port ${PORT}`);
console.log(`Serving files from: ${DIST_DIR}`);

// Check if dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error(`ERROR: Directory not found: ${DIST_DIR}`);
  console.error(`Current working directory: ${__dirname}`);
  console.error(`Contents of ${__dirname}:`, fs.readdirSync(__dirname));
  process.exit(1);
}

console.log(`✓ Dist directory found. Contents:`, fs.readdirSync(DIST_DIR));

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
  let urlPath = decodeURIComponent(req.url);
  if (urlPath.startsWith('/')) {
    urlPath = urlPath.substring(1);
  }
  
  let filePath = path.join(DIST_DIR, urlPath);

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
      // File not found or is directory, serve index.html for SPA routing
      const indexPath = path.join(DIST_DIR, 'index.html');
      fs.readFile(indexPath, (err, data) => {
        if (err) {
          console.error(`Error reading index.html: ${err.message}`);
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
        console.error(`Error reading file: ${err.message}`);
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Client server running on http://0.0.0.0:${PORT}`);
});
