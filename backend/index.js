const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

const MANGADEX_API_URL = 'https://api.mangadex.org';

app.get('/', (req, res) => {
  res.send('Backend is running and CORS is enabled!');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is healthy' });
});

// Robust Proxy for all MangaDex API calls
app.all('/api/:path(*)', async (req, res) => {
  const targetPath = req.params.path;
  const url = `${MANGADEX_API_URL}/${targetPath}`;
  
  console.log(`[Proxy] ${req.method} ${url}`);
  
  try {
    const response = await axios({
      method: req.method,
      url: url,
      params: req.query,
      data: req.body,
      headers: {
        'User-Agent': 'MangaFlow Reader v1.0.0',
        'X-Client-ID': 'personal-client-f6189cad-2a17-4ca6-bba5-69bf4389c447-2143a032',
        'Accept': 'application/json'
      },
      timeout: 15000 // 15s timeout
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[Proxy Error] ${error.message}`);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  }
});

// Listening on 0.0.0.0 is important for Railway
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port: ${port}`);
});
