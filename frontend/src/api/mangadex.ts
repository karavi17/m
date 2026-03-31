import axios from 'axios';

const MANGADEX_BASE_URL = 'https://api.mangadex.org';
const MANGADEX_IMAGE_URL = 'https://uploads.mangadex.org';

const api = axios.create({
  baseURL: MANGADEX_BASE_URL,
  headers: {
    'User-Agent': 'MangaFlow Reader v1.0.0',
    // Personal Client ID provided by user
    'X-Client-ID': 'personal-client-f6189cad-2a17-4ca6-bba5-69bf4389c447-2143a032'
  }
});

const BACKEND_URL = 'https://m-production-8dff.up.railway.app/';

export const searchManga = async (query: string, limit = 20, offset = 0) => {
  try {
    const response = await fetch(`${BACKEND_URL}/manga/${encodeURIComponent(query)}`);
    return await response.json();
  } catch (error) {
    console.error('Backend search failed, falling back to direct API:', error);
    const response = await api.get('/manga', {
      params: {
        title: query,
        limit,
        offset,
        'includes[]': ['cover_art', 'author', 'artist'],
        'contentRating[]': ['safe', 'suggestive'],
        'order[relevance]': 'desc'
      }
    });
    return response.data;
  }
};

export const getLatestManga = async (limit = 20, offset = 0) => {
  const response = await api.get('/manga', {
    params: {
      limit,
      offset,
      'includes[]': ['cover_art', 'author', 'artist'],
      'contentRating[]': ['safe', 'suggestive'],
      'order[latestUploadedChapter]': 'desc'
    }
  });
  return response.data;
};

export const getMangaById = async (id: string) => {
  const response = await api.get(`/manga/${id}`, {
    params: {
      'includes[]': ['cover_art', 'author', 'artist']
    }
  });
  return response.data;
};

export const getMangaChapters = async (id: string, offset = 0, limit = 100) => {
  const response = await api.get(`/manga/${id}/feed`, {
    params: {
      limit,
      offset,
      'translatedLanguage[]': ['en'],
      'order[chapter]': 'desc',
      'contentRating[]': ['safe', 'suggestive'],
      'includeEmptyPages': 0
    }
  });
  return response.data;
};

export const getChapterImages = async (chapterId: string) => {
  const response = await api.get(`/at-home/server/${chapterId}`);
  const { baseUrl, chapter } = response.data;
  const hash = chapter.hash;
  const pages = chapter.data;
  
  return pages.map((page: string) => `${baseUrl}/data/${hash}/${page}`);
};

export const getCoverUrl = (mangaId: string, fileName: string) => {
  return `${MANGADEX_IMAGE_URL}/covers/${mangaId}/${fileName}`;
};

export default api;
