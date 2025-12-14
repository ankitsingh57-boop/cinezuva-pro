
import React, { useEffect, useState, useMemo } from 'react';
import { getMovies } from '../services/storage';
import { Movie, MOVIES_PER_PAGE, CATEGORY_LIST } from '../types';
import { MovieCard } from '../components/MovieCard';
import { ChevronLeft, ChevronRight, Layers, DownloadCloud, Info, Loader2, Flame } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allMovies = await getMovies();
        setMovies(allMovies);
        // Ensure we only take the Top 5 for the big slider
        setTrendingMovies(allMovies.filter(m => m.isTrending).slice(0, 5));
      } catch (error) {
        console.error("Failed to load movies", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (trendingMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trendingMovies.length);
    }, 6000); 
    return () => clearInterval(interval);
  }, [trendingMovies.length]);

  const totalPages = Math.ceil(movies.length / MOVIES_PER_PAGE);
  const currentMovies = useMemo(() => {
    const indexOfLastMovie = currentPage * MOVIES_PER_PAGE;
    const indexOfFirstMovie = indexOfLastMovie - MOVIES_PER_PAGE;
    return movies.slice(indexOfFirstMovie, indexOfLastMovie);
  }, [movies, currentPage]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const commonGenres = ['Action', 'Thriller', 'Romance', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'];

  const getMovieLink = (movie: Movie) => movie.slug ? `/${movie.slug}` : `/${movie.id}`;

  if (isLoading && movies.length === 0) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-red w-12 h-12" />
        </div>
    )
  }

  return (
    <div className="animate-fade-in pb-12 bg-[#0a0a0a] min-h-screen text-gray-100">
      
      {/* --- HERO SECTION (Badge Only - No Title) --- */}
      {trendingMovies.length > 0 && (
        <div className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden mb-12 bg-black group cursor-pointer" onClick={() => navigate(getMovieLink(trendingMovies[currentSlide]))}>
           <div className="absolute inset-0 z-0">
              <img 
                 src={trendingMovies[currentSlide].trendingPoster || trendingMovies[currentSlide].poster} 
                 className="w-full h-full object-cover transition-all duration-1000 opacity-90 group-hover:scale-105"
                 alt="bg-cover"
                 style={{ objectPosition: 'center top' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
           </div>

           <div className="absolute inset-0 z-10 flex flex-col justify-end pb-16 md:pb-20 container mx-auto px-6">
              <div className="max-w-4xl space-y-6">
                 
                 {/* GIANT TRENDING BADGE (Made Smaller as requested) */}
                 <div className="animate-fade-in-up flex flex-col items-start gap-4">
                    <div className="flex items-center gap-2 bg-brand-red text-white px-5 py-2 rounded-r-full border-l-4 border-white shadow-[0_10px_40px_rgba(229,9,20,0.5)] transform -ml-6 pl-8">
                       <Flame fill="white" size={20} className="animate-pulse"/>
                       <div>
                         <span className="block text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Blockbuster</span>
                         <span className="block text-xl md:text-3xl font-black italic tracking-tighter">
                           TRENDING #{currentSlide + 1}
                         </span>
                       </div>
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex flex-wrap items-center gap-4 animate-fade-in-up delay-200 pl-4">
                    <button onClick={(e) => { e.stopPropagation(); navigate(getMovieLink(trendingMovies[currentSlide])); }} className="flex items-center gap-3 bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-full font-bold transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] text-base transform hover:-translate-y-1">
                       <DownloadCloud fill="currentColor" size={20}/> <span>Download Movie</span>
                    </button>
                    
                    <button onClick={(e) => { e.stopPropagation(); navigate(getMovieLink(trendingMovies[currentSlide])); }} className="flex items-center gap-3 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 border border-white/20 px-4 py-3 rounded-full font-bold transition-all text-base">
                       <Info size={20}/>
                    </button>
                 </div>
              </div>
           </div>

           {/* Carousel Indicators */}
           <div className="absolute bottom-8 right-8 z-20 flex gap-3">
             {trendingMovies.map((_, idx) => (
               <button 
                  key={idx} 
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-12 bg-brand-red shadow-[0_0_15px_#e50914]' : 'w-3 bg-white/30 hover:bg-white/60'}`}
               />
             ))}
           </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-[1500px]">
        
        {/* --- FILTERS --- */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
           {/* CATEGORY SCROLL */}
           <div className="w-full overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory scroll-px-4">
             <div className="flex gap-3">
               {CATEGORY_LIST.map((cat) => (
                  <Link 
                    key={cat} 
                    to={`/category/${cat}`} 
                    className="snap-start flex-shrink-0 bg-[#161616] text-gray-400 hover:text-white hover:bg-[#222] border border-white/5 hover:border-brand-red/50 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg whitespace-nowrap active:scale-95"
                  >
                    {cat}
                  </Link>
               ))}
             </div>
           </div>
           
           {/* GENRE SCROLL */}
           <div className="w-full md:w-auto flex-shrink-0 flex gap-2 overflow-x-auto no-scrollbar items-center border-l border-white/10 pl-0 md:pl-6 snap-x snap-mandatory scroll-px-4">
              {commonGenres.map(genre => (
                 <Link 
                    key={genre} 
                    to={`/genre/${genre}`} 
                    className="snap-start text-xs font-medium text-gray-500 hover:text-brand-red px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors whitespace-nowrap"
                 >
                    {genre}
                 </Link>
              ))}
           </div>
        </div>

        {/* --- MAIN GRID --- */}
        <div className="flex items-end justify-between mb-8">
           <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                 <div className="w-1 h-8 bg-brand-red rounded-full"/> Latest Updates
              </h2>
              <p className="text-xs text-gray-500 font-medium pl-4">Fresh movies added recently</p>
           </div>
           <div className="text-xs font-mono text-gray-600 border border-gray-800 px-2 py-1 rounded">Page {currentPage} of {totalPages}</div>
        </div>

        {currentMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-4 md:gap-6 lg:gap-6">
            {currentMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-[#111] rounded-2xl border border-white/5 border-dashed">
            <div className="bg-brand-red/10 p-4 rounded-full mb-4"><Layers size={32} className="text-brand-red"/></div>
            <p className="text-gray-400 font-medium">No movies found in database.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-20 pb-10">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="w-12 h-12 flex items-center justify-center rounded-full bg-[#161616] text-white disabled:opacity-30 hover:bg-brand-red transition-all border border-white/5 shadow-lg active:scale-90"><ChevronLeft size={20} /></button>
            <span className="font-mono text-sm text-gray-500 mx-4">Page <span className="text-white font-bold">{currentPage}</span> / {totalPages}</span>
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="w-12 h-12 flex items-center justify-center rounded-full bg-[#161616] text-white disabled:opacity-30 hover:bg-brand-red transition-all border border-white/5 shadow-lg active:scale-90"><ChevronRight size={20} /></button>
          </div>
        )}
      </div>
    </div>
  );
};
