// Test production build serving
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5002;

// Serve static files from dist/public
const staticPath = path.join(__dirname, 'dist', 'public');
console.log('Serving static files from:', staticPath);
console.log('Directory exists:', fs.existsSync(staticPath));

if (fs.existsSync(staticPath)) {
  console.log('Files in static directory:');
  fs.readdirSync(staticPath).forEach(file => {
    console.log(' -', file);
  });
}

app.use(express.static(staticPath));

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Index file not found');
  }
});

app.listen(port, () => {
  console.log(`Test production server running on http://localhost:${port}`);
});