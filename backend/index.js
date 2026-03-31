const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MANGADEX_API_URL = 'https://api.mangadex.org';

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is healthy' });
});

// Generic Proxy for all MangaDex API calls
app.all('/api/*', async (req, res) => {
  try {
    const path = req.params[0];
    const url = `${MANGADEX_API_URL}/${path}`;
    
    console.log(`Proxying request to: ${url}`);
    
    const response = await axios({
      method: req.method,
      url: url,
      params: req.query,
      data: req.body,
      headers: {
        'User-Agent': 'MangaFlow Reader v1.0.0',
        'X-Client-ID': 'personal-client-f6189cad-2a17-4ca6-bba5-69bf4389c447-2143a032'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
