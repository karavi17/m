const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Cache settings: 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Enable CORS for ALL requests
app.use(cors());
app.use(express.json());

const MANGADEX_API_URL = 'https://api.mangadex.org';
const MANGADEX_IMAGE_URL = 'https://uploads.mangadex.org';

app.get('/', (req, res) => {
  res.send('Backend is running with caching enabled!');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is healthy', cacheKeys: cache.keys().length });
});

// Proxy for MangaDex Images (Covers)
app.get('/proxy/cover/:mangaId/:fileName', async (req, res) => {
  const { mangaId, fileName } = req.params;
  const url = `${MANGADEX_IMAGE_URL}/covers/${mangaId}/${fileName}`;
  
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });
    
    res.setHeader('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (error) {
    res.status(404).send('Cover not found');
  }
});

// Proxy for Chapter Images (At-Home server)
app.get('/proxy/at-home/server/:chapterId', async (req, res) => {
  const { chapterId } = req.params;
  const cacheKey = `at-home-${chapterId}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(`${MANGADEX_API_URL}/at-home/server/${chapterId}`);
    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chapter info' });
  }
});

// Generic Image Proxy (for any external URL)
app.get('/proxy/image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL is required');

  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'Referer': 'https://mangadex.org'
      }
    });
    
    res.setHeader('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (error) {
    res.status(404).send('Image not found');
  }
});

// Powerful Proxy Route for all MangaDex API calls with Caching
app.use('/api', async (req, res) => {
  const targetPath = req.url.replace(/^\//, '');
  const url = `${MANGADEX_API_URL}/${targetPath}`;
  
  // Create a unique cache key based on URL and query params
  const cacheKey = `${req.method}-${url}-${JSON.stringify(req.query)}`;
  
  // Only cache GET requests
  if (req.method === 'GET') {
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      console.log(`[Cache Hit] ${url}`);
      return res.json(cachedResponse);
    }
  }

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
      }
    });
    
    // Cache the successful GET response
    if (req.method === 'GET') {
      cache.set(cacheKey, response.data);
    }

    res.header('Access-Control-Allow-Origin', '*');
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

// Listen on all network interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running and listening on 0.0.0.0:${port}`);
});
