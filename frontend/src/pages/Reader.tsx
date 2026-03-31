import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getChapterImages, getChapterById, getMangaChapters } from '../api/mangadex';
import { Loader2, AlertCircle, ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Reader() {
  const { id } = useParams<{ id: string }>();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [nextChapterId, setNextChapterId] = useState<string | null>(null);
  const [prevChapterId, setPrevChapterId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [imagesData, chapterData] = await Promise.all([
          getChapterImages(id),
          getChapterById(id)
        ]);
        setImages(imagesData);

        const mangaId = chapterData.data.relationships.find((r: any) => r.type === 'manga')?.id;
        const currentChapterNum = parseFloat(chapterData.data.attributes.chapter || '0');

        if (mangaId) {
          // Fetch next chapter
          const nextChapters = await getMangaChapters(mangaId, 0, 1, {
            'order[chapter]': 'asc',
            offset: 0,
            limit: 1,
            translatedLanguage: ['en'],
            'chapter': (currentChapterNum + 0.1).toString(), // This is a bit hacky, let's use a better way
          });
          
          // Actually, let's just fetch the whole feed or at least the neighbors
          const allChapters = await getMangaChapters(mangaId, 0, 100, {
            'order[chapter]': 'asc',
            'translatedLanguage[]': ['en']
          });

          const currentIndex = allChapters.data.findIndex((c: any) => c.id === id);
          if (currentIndex !== -1) {
            if (currentIndex < allChapters.data.length - 1) {
              setNextChapterId(allChapters.data[currentIndex + 1].id);
            }
            if (currentIndex > 0) {
              setPrevChapterId(allChapters.data[currentIndex - 1].id);
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch chapter images');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const pageIndex = Math.floor(scrollPosition / (document.documentElement.scrollHeight / images.length));
      setCurrentPage(Math.min(pageIndex, images.length - 1));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [images.length]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-400 font-medium">Loading chapter...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-400 gap-4 p-4 text-center">
        <AlertCircle className="w-12 h-12" />
        <p className="text-xl font-medium">{error}</p>
        <Link 
          to="/"
          className="bg-primary text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-secondary/50 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-secondary rounded-full transition-colors group"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <Link to="/" className="p-2 hover:bg-secondary rounded-full transition-colors">
            <img src="/logo.png" alt="Home" className="w-6 h-6 object-contain" />
          </Link>
        </div>

        <div className="text-sm font-bold tracking-wider flex items-center gap-2">
          <span className="text-primary">{currentPage + 1}</span>
          <span className="text-gray-500">/</span>
          <span className="text-gray-400">{images.length}</span>
        </div>

        <div className="flex items-center gap-2">
          {prevChapterId && (
            <button 
              onClick={() => navigate(`/chapter/${prevChapterId}`)}
              className="flex items-center gap-2 bg-secondary px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-primary/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Prev</span>
            </button>
          )}
          {nextChapterId && (
            <button 
              onClick={() => navigate(`/chapter/${nextChapterId}`)}
              className="flex items-center gap-2 bg-primary px-4 py-1.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              <span className="hidden md:inline">Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-14 max-w-4xl mx-auto w-full flex flex-col items-center">
        <AnimatePresence>
          {images.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "200px" }}
              transition={{ duration: 0.5 }}
              className="w-full relative min-h-[400px]"
            >
              <img 
                src={url} 
                alt={`Page ${index + 1}`}
                className="w-full h-auto select-none"
                loading={index < 3 ? "eager" : "lazy"}
              />
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-gray-400 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                P.{index + 1}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="py-20 text-center flex flex-col items-center gap-6 border-t border-secondary mt-12">
        <p className="text-gray-400 font-medium">End of Chapter</p>
        <div className="flex flex-wrap justify-center gap-4">
          {prevChapterId && (
            <button 
              onClick={() => navigate(`/chapter/${prevChapterId}`)}
              className="bg-secondary text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform border border-gray-700"
            >
              Previous Chapter
            </button>
          )}
          <button 
            onClick={() => navigate(-1)}
            className="bg-secondary text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform border border-gray-700"
          >
            Manga Detail
          </button>
          {nextChapterId && (
            <button 
              onClick={() => navigate(`/chapter/${nextChapterId}`)}
              className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
              Next Chapter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
