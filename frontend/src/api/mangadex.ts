import axios from 'axios';

const BACKEND_URL = 'https://m-production-8dff.up.railway.app';
const BACKEND_API_URL = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: BACKEND_API_URL
});

export const searchManga = async (query: string, limit = 20, offset = 0) => {
  try {
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
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
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

export const getMangaChapters = async (id: string, offset = 0, limit = 100, params = {}) => {
  const response = await api.get(`/manga/${id}/feed`, {
    params: {
      limit,
      offset,
      'translatedLanguage[]': ['en'],
      'order[chapter]': 'desc',
      'contentRating[]': ['safe', 'suggestive'],
      'includeEmptyPages': 0,
      ...params
    }
  });
  return response.data;
};

export const getChapterById = async (chapterId: string) => {
  const response = await api.get(`/chapter/${chapterId}`, {
    params: {
      'includes[]': ['manga']
    }
  });
  return response.data;
};

export const getChapterImages = async (chapterId: string) => {
  // Use backend proxy for at-home server info
  const response = await axios.get(`${BACKEND_URL}/proxy/at-home/server/${chapterId}`);
  const { baseUrl, chapter } = response.data;
  const hash = chapter.hash;
  const pages = chapter.data;
  
  // Proxy each image through the backend to avoid CORS/Referer issues
  return pages.map((page: string) => {
    const originalUrl = `${baseUrl}/data/${hash}/${page}`;
    return `${BACKEND_URL}/proxy/image?url=${encodeURIComponent(originalUrl)}`;
  });
};

export const getCoverUrl = (mangaId: string, fileName: string) => {
  // Use backend proxy for covers
  return `${BACKEND_URL}/proxy/cover/${mangaId}/${fileName}`;
};

export default api;
