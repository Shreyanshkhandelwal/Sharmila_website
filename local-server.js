require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Map the Vercel API endpoint to local express router
app.post('/api/subscribe', async (req, res) => {
  console.log(`[Local API] POST /api/subscribe called with body:`, req.body);
  // Directly invoke the Vercel serverless function logic
  const handler = require('./api/subscribe.js');
  try {
    await handler(req, res);
    console.log(`[Local API] Successfully handled request for ${req.body.email}`);
  } catch (err) {
    console.error(`[Local API] Error handling request:`, err);
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Local testing error' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Local Vercel-like server running on http://localhost:${PORT}`);
});
