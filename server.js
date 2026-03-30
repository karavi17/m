import express from 'express';
import cors from 'cors';

const app = express();
// Railway automatically assigns a PORT, 0.0.0.0 is required for binding
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// CORS Configuration
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigin === '*' || allowedOrigin.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Root route for Health Check
app.get('/', (req, res) => {
  res.json({ 
    status: 'running', 
    message: 'MangaFlow Backend is operational',
    timestamp: new Date().toISOString()
  });
});

// Manga route using native fetch (Node 18+)
app.get('/manga/:title', async (req, res) => {
  const { title } = req.params;
  try {
    const response = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&includes[]=cover_art&includes[]=author&includes[]=artist&contentRating[]=safe&contentRating[]=suggestive`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching manga:', error);
    res.status(500).json({ error: 'Failed to fetch manga data' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
