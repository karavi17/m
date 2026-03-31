import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="bg-background border-b border-secondary sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tight">
          <BookOpen className="w-8 h-8" />
          <span>MangaFlow</span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search manga..."
            className="w-full bg-secondary text-accent px-4 py-2 pl-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-primary/50"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
        </form>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <a href="#" className="hover:text-primary transition-colors">Popular</a>
          <a href="#" className="hover:text-primary transition-colors">Latest</a>
        </div>
      </div>
    </nav>
  );
}
