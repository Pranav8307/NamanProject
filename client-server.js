/**
 * Simple Express server to serve the React client with SPA routing
 * Use this instead of Static Site if Render's Static Site doesn't support redirects
 * 
 * Run: node client-server.js
 * Or add to package.json: "start:client": "node client-server.js"
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from client/dist
app.use(express.static(path.join(__dirname, 'client/dist')));

// SPA fallback: all routes return index.html so React Router can handle them
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Client server running on port ${PORT}`);
});
