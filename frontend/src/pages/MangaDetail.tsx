import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMangaById, getMangaChapters, getCoverUrl, getFirstAndLastChapter } from '../api/mangadex';
import { Manga, Chapter } from '../types/mangadex';
import { Loader2, AlertCircle, BookOpen, Clock, Tag, ChevronRight, ChevronLeft, Play, FastForward } from 'lucide-react';
import { motion } from 'framer-motion';

export function MangaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [firstChapter, setFirstChapter] = useState<Chapter | null>(null);
  const [lastChapter, setLastChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [totalChapters, setTotalChapters] = useState(0);
  const [jumpChapter, setJumpChapter] = useState('');
  const CHAPTERS_LIMIT = 100;
  const chapterListRef = useRef<HTMLDivElement>(null);

  const fetchChapters = async (newOffset: number) => {
    if (!id) return;
    try {
      const chaptersData = await getMangaChapters(id, newOffset, CHAPTERS_LIMIT);
      setChapters(chaptersData.data);
      setTotalChapters(chaptersData.total);
      setOffset(newOffset);
      if (chapterListRef.current) {
        chapterListRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error('Failed to fetch chapters:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [mangaData, chaptersData, firstLastData] = await Promise.all([
          getMangaById(id),
          getMangaChapters(id, 0, CHAPTERS_LIMIT),
          getFirstAndLastChapter(id)
        ]);
        setManga(mangaData.data);
        setChapters(chaptersData.data);
        setTotalChapters(chaptersData.total);
        setFirstChapter(firstLastData.first || null);
        setLastChapter(firstLastData.last || null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch manga details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleJumpToChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumpChapter) return;
    
    // Find chapter in current list or redirect
    const foundChapter = chapters.find(c => c.attributes.chapter === jumpChapter);
    if (foundChapter) {
      navigate(`/chapter/${foundChapter.id}`);
    } else {
      // In a real app, you'd search for the chapter ID by number
      alert(`Chapter ${jumpChapter} not found in current list. Please use pagination to find it.`);
    }
  };

  const readFirst = () => {
    if (firstChapter) {
      navigate(`/chapter/${firstChapter.id}`);
    } else if (chapters.length > 0) {
      // Fallback if firstChapter is not loaded
      const lastChapter = [...chapters].sort((a, b) => 
        parseFloat(a.attributes.chapter || '0') - parseFloat(b.attributes.chapter || '0')
      )[0];
      if (lastChapter) navigate(`/chapter/${lastChapter.id}`);
    }
  };

  const readLast = () => {
    if (lastChapter) {
      navigate(`/chapter/${lastChapter.id}`);
    } else if (chapters.length > 0) {
      // Fallback if lastChapter is not loaded
      const latestChapter = [...chapters].sort((a, b) => 
        parseFloat(b.attributes.chapter || '0') - parseFloat(a.attributes.chapter || '0')
      )[0];
      if (latestChapter) navigate(`/chapter/${latestChapter.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-400 gap-4">
        <AlertCircle className="w-12 h-12" />
        <p className="text-xl font-medium">{error || 'Manga not found'}</p>
        <Link 
          to="/"
          className="bg-primary text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const coverRel = manga.relationships.find(r => r.type === 'cover_art');
  const coverFile = coverRel?.attributes?.fileName;
  const coverUrl = coverFile ? getCoverUrl(manga.id, coverFile) : 'https://placehold.co/300x450/2d2d2d/ffffff?text=No+Cover';
  const title = manga.attributes.title.en || Object.values(manga.attributes.title)[0] || 'Unknown Title';
  const description = manga.attributes.description.en || Object.values(manga.attributes.description)[0] || 'No description available.';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-1/3 max-w-sm mx-auto md:mx-0"
        >
          <img 
            src={coverUrl} 
            alt={title}
            className="w-full rounded-2xl shadow-2xl border border-secondary"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <div className="flex items-center gap-2 text-primary mb-2 font-semibold tracking-wide">
            <span className="bg-primary/10 px-3 py-1 rounded-full text-xs uppercase">
              {manga.attributes.status}
            </span>
            <span className="bg-secondary px-3 py-1 rounded-full text-xs uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {manga.attributes.year || 'Unknown Year'}
            </span>
          </div>
          <h1 className="text-4xl font-black mb-6 leading-tight">{title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {manga.attributes.tags.map(tag => (
              <span 
                key={tag.id}
                className="bg-secondary text-gray-400 px-3 py-1 rounded-lg text-sm border border-transparent hover:border-primary/50 transition-colors flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5" />
                {tag.attributes.name.en}
              </span>
            ))}
          </div>

          <div className="bg-secondary/50 rounded-2xl p-6 border border-secondary">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Synopsis
            </h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line line-clamp-6 hover:line-clamp-none transition-all duration-300">
              {description}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button 
              onClick={readFirst}
              className="flex-1 min-w-[140px] bg-primary hover:bg-primary/80 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              <Play className="w-5 h-5" />
              Read First
            </button>
            <button 
              onClick={readLast}
              className="flex-1 min-w-[140px] bg-secondary hover:bg-secondary/80 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-700"
            >
              <FastForward className="w-5 h-5" />
              Read Latest
            </button>
            
            <form onSubmit={handleJumpToChapter} className="flex-1 min-w-[200px] flex gap-2">
              <input 
                type="number" 
                step="0.1"
                placeholder="Ch. No."
                value={jumpChapter}
                onChange={(e) => setJumpChapter(e.target.value)}
                className="flex-1 bg-secondary border border-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:border-primary transition-colors text-white"
              />
              <button 
                type="submit"
                className="bg-primary px-6 py-2 rounded-xl font-bold hover:bg-primary/80 transition-all"
              >
                Go
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      <div ref={chapterListRef} className="border-t border-secondary pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            Chapters
            <span className="text-sm font-normal text-gray-500">({totalChapters} available)</span>
          </h2>
          
          {totalChapters > CHAPTERS_LIMIT && (
            <div className="flex items-center gap-2">
              <button 
                disabled={offset === 0}
                onClick={() => fetchChapters(Math.max(0, offset - CHAPTERS_LIMIT))}
                className="p-2 rounded-lg bg-secondary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium px-4">
                Page {Math.floor(offset / CHAPTERS_LIMIT) + 1} of {Math.ceil(totalChapters / CHAPTERS_LIMIT)}
              </span>
              <button 
                disabled={offset + CHAPTERS_LIMIT >= totalChapters}
                onClick={() => fetchChapters(offset + CHAPTERS_LIMIT)}
                className="p-2 rounded-lg bg-secondary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Link 
                to={`/chapter/${chapter.id}`}
                className="block bg-secondary hover:bg-primary/10 border border-transparent hover:border-primary/50 p-4 rounded-xl transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg group-hover:text-primary transition-colors">
                    Chapter {chapter.attributes.chapter || '0'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(chapter.attributes.publishAt).toLocaleDateString()}
                  </span>
                </div>
                {chapter.attributes.title && (
                  <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                    {chapter.attributes.title}
                  </p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
