import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Palette, Lock, Film } from 'lucide-react';
import { themes, applyTheme, getCurrentTheme } from '../services/theme';
import { getMovies } from '../services/storage';
import { Movie } from '../types';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState('netflix');
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentThemeId(getCurrentTheme());
    
    // Click outside logic
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    
    if (val.trim().length > 0) {
      // Fetch movies asynchronously
      const allMovies = await getMovies();
      const lowerVal = val.toLowerCase();
      const hits = [];
      for (const m of allMovies) {
        if (hits.length >= 6) break;
        if (m.title.toLowerCase().includes(lowerVal) || (m.seoTags && m.seoTags.toLowerCase().includes(lowerVal))) {
          hits.push(m);
        }
      }
      setSuggestions(hits);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSuggestions([]);
      setIsMenuOpen(false);
      setIsSearchVisible(false);
    }
  };

  // Critical: Use onMouseDown to trigger before input blur
  const handleSuggestionClick = (id: string) => {
    // Clear state immediately to remove UI elements
    setSearchTerm('');
    setSuggestions([]);
    setIsSearchVisible(false);
    setIsMenuOpen(false);
    // Navigate immediately
    navigate(`/movie/${id}`);
  };

  const handleThemeChange = (id: string) => {
    applyTheme(id);
    setCurrentThemeId(id);
    setIsThemeOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-dark/95 backdrop-blur-xl border-b border-white/5 shadow-lg transition-colors duration-500">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-red to-black rounded-lg flex items-center justify-center shadow-lg shadow-brand-red/20 group-hover:scale-105 transition-transform">
             <span className="font-black text-white text-xl italic tracking-tighter">C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white leading-none group-hover:text-gray-200 transition-colors">
              CINE<span className="text-brand-red">ZUVA</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/category/Bollywood" className="hover:text-brand-red transition-colors">Bollywood</Link>
          <Link to="/category/Hollywood" className="hover:text-brand-red transition-colors">Hollywood</Link>
          <Link to="/category/South" className="hover:text-brand-red transition-colors">South</Link>
          <Link to="/category/Web Series" className="hover:text-brand-red transition-colors">Web Series</Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          
          {/* Theme Switcher - Now Visible on Mobile */}
          <div className="relative">
             <button onClick={() => setIsThemeOpen(!isThemeOpen)} className="p-2 text-gray-300 hover:text-brand-red transition-colors rounded-full hover:bg-white/5"><Palette size={20} /></button>
             {isThemeOpen && (
               <div className="absolute top-full right-0 mt-2 w-48 bg-brand-card border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
                 <div className="p-2 space-y-1">
                    {themes.map(t => (
                      <button key={t.id} onClick={() => handleThemeChange(t.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${currentThemeId === t.id ? 'bg-brand-red text-white' : 'text-gray-300 hover:bg-white/5'}`}>
                         <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.colors.red }} />
                         {t.name}
                      </button>
                    ))}
                 </div>
               </div>
             )}
          </div>

          <Link to="/admin" className="hidden sm:flex items-center gap-1 bg-white/5 hover:bg-white/10 text-xs text-gray-300 px-3 py-2 rounded-full transition-all border border-white/5 hover:border-brand-red/30">
            <Lock size={14} className="text-brand-red" /> <span>Admin</span>
          </Link>

          {/* Search (Desktop) */}
          <div className="relative hidden sm:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input 
                type="text" placeholder="Search movies..." value={searchTerm} onChange={handleSearchChange}
                className="bg-black/20 border border-gray-700/50 rounded-full px-4 py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-brand-red focus:bg-black/50 w-32 focus:w-64 transition-all placeholder:text-gray-600"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-red transition-colors"><Search size={16} /></button>
            </form>
            
            {/* Live Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-brand-card border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in z-[60]">
                 {suggestions.map(movie => (
                   <div 
                     key={movie.id} 
                     onMouseDown={() => handleSuggestionClick(movie.id)} 
                     className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer border-b border-gray-800 last:border-0 transition-colors"
                   >
                      <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded bg-gray-800"/>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-sm font-bold text-white truncate">{movie.title}</h4>
                         <div className="flex items-center gap-2 text-[10px] text-gray-400">
                           <span>{movie.year}</span>
                           <span className="text-brand-red">{movie.language}</span>
                         </div>
                      </div>
                   </div>
                 ))}
                 <button onMouseDown={handleSearchSubmit} className="w-full text-center text-xs text-gray-400 hover:text-white p-2 bg-black/40 hover:bg-black/60">View all results</button>
              </div>
            )}
          </div>
          
          {/* Mobile Search Button */}
          <button className="md:hidden text-gray-300 hover:text-white p-2" onClick={() => setIsSearchVisible(!isSearchVisible)}><Search size={22} /></button>
          <button className="md:hidden text-gray-300 hover:text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </div>

      {/* Mobile Search Input */}
      {isSearchVisible && (
         <div className="md:hidden bg-black p-4 border-b border-gray-800 animate-fade-in fixed top-[60px] left-0 right-0 z-[60] shadow-2xl">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearchChange} className="w-full bg-brand-card border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-brand-red outline-none" autoFocus />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"><Search size={20} /></button>
            </form>
             {suggestions.length > 0 && (
              <div className="mt-2 bg-brand-card border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[70] max-h-[60vh] overflow-y-auto">
                 {suggestions.map(movie => (
                   <div 
                     key={movie.id} 
                     onMouseDown={() => handleSuggestionClick(movie.id)} 
                     className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer border-b border-gray-800"
                   >
                      <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded"/>
                      <div><h4 className="text-sm font-bold text-white">{movie.title}</h4><span className="text-xs text-gray-400">{movie.year}</span></div>
                   </div>
                 ))}
              </div>
            )}
         </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-brand-card border-b border-gray-800 p-4 animate-fade-in-down shadow-2xl absolute w-full left-0 z-50">
          <div className="flex flex-col gap-2">
            <Link to="/" className="p-3 hover:bg-white/5 rounded-lg text-gray-300 hover:text-white font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/admin" className="p-3 hover:bg-white/5 rounded-lg text-gray-300 hover:text-brand-red font-medium flex items-center gap-2" onClick={() => setIsMenuOpen(false)}><Lock size={16} /> Admin Panel</Link>
            <Link to="/category/Bollywood" className="p-3 hover:bg-white/5 rounded-lg text-gray-300 hover:text-brand-red font-medium" onClick={() => setIsMenuOpen(false)}>Bollywood</Link>
            <Link to="/category/Hollywood" className="p-3 hover:bg-white/5 rounded-lg text-gray-300 hover:text-brand-red font-medium" onClick={() => setIsMenuOpen(false)}>Hollywood</Link>
            <Link to="/category/South" className="p-3 hover:bg-white/5 rounded-lg text-gray-300 hover:text-brand-red font-medium" onClick={() => setIsMenuOpen(false)}>South</Link>
          </div>
        </div>
      )}
    </header>
  );
};