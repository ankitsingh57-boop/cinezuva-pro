import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovies } from '../services/storage';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Grid, Loader2 } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
        if (name) {
          setLoading(true);
          window.scrollTo(0, 0);
          const all = await getMovies();
          // Filter movies that contain the category name in their category array
          setMovies(all.filter(m => m.category.includes(name)));
          setLoading(false);
        }
    };
    fetchCategory();
  }, [name]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-[80vh] animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 bg-black/40 w-max px-4 py-2 rounded-full border border-white/10">
          <Link to="/" className="hover:text-brand-red transition-colors">Home</Link>
          <span className="text-gray-600">/</span>
          <span className="text-gray-200">Category</span>
          <span className="text-gray-600">/</span>
          <span className="text-brand-red font-bold">{name}</span>
        </div>

       <div className="flex items-center justify-between mb-8 border-l-4 border-brand-red pl-4">
          <h2 className="text-3xl font-bold text-white uppercase flex items-center gap-3">
             <Grid className="text-gray-500" /> {name} <span className="text-gray-600 text-lg font-normal">Movies</span>
          </h2>
          <span className="text-gray-500 text-sm font-medium bg-[#1a1a1a] px-3 py-1 rounded-full border border-white/5">{loading ? '...' : movies.length} Results</span>
        </div>

        {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-red w-10 h-10"/></div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 lg:gap-8">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center py-20 bg-[#1a1a1a] rounded-2xl border border-white/5">
             <div className="text-6xl mb-4">🗂️</div>
             <p className="text-xl text-gray-300 font-bold mb-2">No movies found in this category.</p>
             <p className="text-sm text-gray-500">Check back later for updates!</p>
             <Link to="/" className="mt-6 bg-brand-red text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-colors">Go Home</Link>
           </div>
        )}
    </div>
  );
};