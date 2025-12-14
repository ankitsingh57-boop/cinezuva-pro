import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getMovies } from '../services/storage';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Search, Loader2 } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (query) {
        setLoading(true);
        window.scrollTo(0, 0);
        const allMovies = await getMovies();
        const filtered = allMovies.filter(m => 
          m.title.toLowerCase().includes(query.toLowerCase()) || 
          m.category.some(c => c.toLowerCase().includes(query.toLowerCase())) ||
          m.qualityTag.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[60vh] animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 bg-black/40 w-max px-4 py-2 rounded-full border border-white/10">
          <Link to="/" className="hover:text-brand-red transition-colors">Home</Link>
          <span className="text-gray-600">/</span>
          <span className="text-brand-red font-bold">Search</span>
      </div>

      <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
        <Search className="text-brand-red" size={28} />
        <h2 className="text-2xl font-bold text-white">
           Results for <span className="text-brand-red">"{query}"</span>
        </h2>
        <span className="ml-auto text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
            {loading ? <Loader2 className="animate-spin h-3 w-3"/> : results.length} Found
        </span>
      </div>
      
      {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-red w-10 h-10"/></div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-6">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-brand-card rounded-2xl border border-gray-800 border-dashed">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-300 font-bold mb-2">No matches found</p>
          <p className="text-sm text-gray-500">Try different keywords or check the spelling.</p>
        </div>
      )}
    </div>
  );
};