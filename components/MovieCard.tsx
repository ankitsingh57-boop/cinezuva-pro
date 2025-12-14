
import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../types';
import { Play } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
}

// React.memo prevents unnecessary re-renders when parent state updates, essential for "Lag Free" lists
export const MovieCard = memo(({ movie }: MovieCardProps) => {
  // Fallback to ID if slug is missing (legacy support)
  const linkTarget = movie.slug ? `/${movie.slug}` : `/${movie.id}`;

  return (
    <Link 
      to={linkTarget} 
      className="group relative block bg-[#161616] rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(229,9,20,0.3)] ring-1 ring-white/5 hover:ring-brand-red/40"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-[#222]">
        {/* Bottom Black Shadow Gradient - Enhanced for visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 opacity-100 transition-opacity" />
        
        <img 
          src={movie.poster} 
          alt={movie.title} 
          loading="lazy" 
          width="300" 
          height="450"
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 will-change-transform"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
          <div className="bg-brand-red p-4 rounded-full text-white shadow-[0_0_25px_rgba(229,9,20,0.8)] transform scale-50 group-hover:scale-100 transition-all duration-300 hover:bg-white hover:text-brand-red">
            <Play fill="currentColor" size={28} className="ml-1" />
          </div>
        </div>

        {/* Quality Badge */}
         <div className="absolute top-2 left-2 z-20">
            <span className="bg-black/70 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest shadow-lg">
              {movie.qualityTag}
            </span>
         </div>
      </div>

      {/* Content */}
      <div className="p-3 relative z-20 bg-gradient-to-b from-[#161616] to-[#0a0a0a]">
        <h3 className="text-[14px] font-bold text-gray-100 truncate group-hover:text-brand-red transition-colors leading-snug">
          {movie.title}
        </h3>
        <div className="flex justify-between items-center mt-2 text-xs font-medium text-gray-500">
          <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5">
            {movie.year}
          </span>
          <span className="uppercase tracking-wide text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">
            {movie.language}
          </span>
        </div>
      </div>
    </Link>
  );
});

MovieCard.displayName = 'MovieCard';
