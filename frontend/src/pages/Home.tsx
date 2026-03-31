import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getLatestManga, searchManga, getCoverUrl } from '../api/mangadex';
import { Manga } from '../types/mangadex';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function Home() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = query 
          ? await searchManga(query) 
          : await getLatestManga();
        setMangas(data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch manga');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-400 gap-4">
        <AlertCircle className="w-12 h-12" />
        <p className="text-xl font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
        {query ? `Search results for: "${query}"` : 'Latest Updates'}
        <span className="w-2 h-2 rounded-full bg-primary" />
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {mangas.map((manga, index) => {
          const coverRel = manga.relationships.find(r => r.type === 'cover_art');
          const coverFile = coverRel?.attributes?.fileName;
          const coverUrl = coverFile ? getCoverUrl(manga.id, coverFile) : 'https://placehold.co/300x450/2d2d2d/ffffff?text=No+Cover';
          const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0] || 'Unknown Title';

          return (
            <motion.div
              key={manga.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <Link to={`/manga/${manga.id}`} className="block relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg hover:shadow-primary/20 transition-all border border-secondary">
                <img 
                  src={coverUrl} 
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-primary text-sm font-semibold mb-1">
                    {manga.attributes.status.toUpperCase()}
                  </span>
                  <p className="text-white text-sm font-bold line-clamp-2">
                    {title}
                  </p>
                </div>
              </Link>
              <h3 className="mt-3 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
            </motion.div>
          );
        })}
      </div>

      {mangas.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">No manga found.</p>
        </div>
      )}
    </div>
  );
}
