const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MANGADEX_BASE_URL = 'https://api.mangadex.org';

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is healthy' });
});

// Proxy for MangaDex API
app.get('/api/manga', async (req, res) => {
  try {
    const response = await axios.get(`${MANGADEX_BASE_URL}/manga`, {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from MangaDex' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
