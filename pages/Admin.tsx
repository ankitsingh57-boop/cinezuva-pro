
import React, { useState, useEffect, useMemo } from 'react';
import { addMovie, getMovies, updateMovie, deleteMovie, getRequests, deleteRequest, getSiteConfig, saveSiteConfig, createSlug } from '../services/storage';
import { generateMovieDetails } from '../services/ai';
import { logout } from '../services/auth';
import { DownloadLink, Movie, MovieRequest, CATEGORY_LIST } from '../types';
import { Plus, Trash, CheckCircle, Edit2, X, Wand2, Loader2, Settings, MessageSquare, Film, Save, ChevronLeft, ChevronRight, TrendingUp, Image as ImageIcon, Link as LinkIcon, AlertCircle, Eye, LayoutDashboard, DownloadCloud, Tag, Languages, LogOut, FileText } from 'lucide-react';
import { getYouTubeEmbedUrl } from '../utils/video';

const ADMIN_ITEMS_PER_PAGE = 20;

const GENRE_LIST = [
  "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", 
  "Documentary", "Drama", "Family", "Fantasy", "Film-Noir", "History", 
  "Horror", "Music", "Musical", "Mystery", "Romance", "Sci-Fi", 
  "Short", "Sport", "Thriller", "War", "Western", "18+", "Erotic", 
  "Psychological", "Supernatural", "Superhero", "Zombie", "Survival"
];

const LANGUAGE_LIST = [
  "Hindi", "Tamil", "English", "Telugu", "Kannada", "Malayalam", "Bengali", "Marathi", "Punjabi", "Gujarati", "Urdu", "Bhojpuri", 
  "Korean", "Japanese", "Chinese", "Spanish", "French", "Russian", "German", "Thai", "Indonesian"
];

// Time Filter Types
type TimeRange = '1W' | '1M' | '3M' | '1Y' | 'ALL';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'movies' | 'requests' | 'settings'>('dashboard');
  
  // Dashboard Filters
  const [timeFilter, setTimeFilter] = useState<TimeRange>('ALL');

  // Data State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [requests, setRequests] = useState<MovieRequest[]>([]);
  const [config, setConfig] = useState({ howToDownloadUrl: '', telegramUrl: '' });
  const [loadingData, setLoadingData] = useState(false);
  
  // UI State
  const [success, setSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    poster: '',
    year: new Date().getFullYear().toString(),
    description: '',
    trailerUrl: '',
    qualityTag: '1080p',
    isTrending: false,
    trendingPoster: '', 
    seoTags: ''
  });

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Hindi']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Bollywood']);
  const [screenshots, setScreenshots] = useState<string[]>(['']);
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([
    { quality: 'Download Link', size: '', url: '' }
  ]);

  // Helper Function for Filtering by Time
  const filterByTime = (timestamp: number) => {
    if (timeFilter === 'ALL') return true;
    const now = Date.now();
    const diff = now - timestamp;
    const oneDay = 24 * 60 * 60 * 1000;
    
    switch (timeFilter) {
      case '1W': return diff <= 7 * oneDay;
      case '1M': return diff <= 30 * oneDay;
      case '3M': return diff <= 90 * oneDay;
      case '1Y': return diff <= 365 * oneDay;
      default: return true;
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoadingData(true);
    try {
      const [m, r, c] = await Promise.all([getMovies(), getRequests(), getSiteConfig()]);
      setMovies(m);
      setRequests(r);
      setConfig(c);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // --- Handlers ---
  const toggleSelection = (item: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    let newState;
    if (current.includes(item)) {
      newState = current.filter(i => i !== item);
    } else {
      newState = [...current, item];
    }
    setter(newState);
  };

  const handleLinkChange = (idx: number, field: keyof DownloadLink, val: string) => {
    const newLinks = [...downloadLinks]; newLinks[idx] = { ...newLinks[idx], [field]: val }; setDownloadLinks(newLinks);
  };
  const addLinkField = () => setDownloadLinks([...downloadLinks, { quality: 'Download Link', size: '', url: '' }]);
  const removeLinkField = (idx: number) => {
    const newLinks = [...downloadLinks]; newLinks.splice(idx, 1); setDownloadLinks(newLinks);
  };

  const handleScreenshotChange = (idx: number, val: string) => {
    const newScreenshots = [...screenshots];
    newScreenshots[idx] = val;
    setScreenshots(newScreenshots);
  };

  const addScreenshotField = () => {
    setScreenshots([...screenshots, '']);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', slug: '', poster: '', year: new Date().getFullYear().toString(), description: '', trailerUrl: '', qualityTag: '1080p', isTrending: false, trendingPoster: '', seoTags: '' });
    setSelectedGenres([]);
    setSelectedLanguages(['Hindi']);
    setSelectedCategories(['Bollywood']);
    setScreenshots(['']);
    setDownloadLinks([{ quality: 'Download Link', size: '', url: '' }]);
  };

  const handleEdit = (movie: Movie) => {
    setEditingId(movie.id);
    setFormData({ 
      title: movie.title, 
      slug: movie.slug || createSlug(movie.title), // Fallback if old movie has no slug
      poster: movie.poster, 
      year: movie.year, 
      description: movie.description, 
      trailerUrl: movie.trailerUrl, 
      qualityTag: movie.qualityTag, 
      isTrending: !!movie.isTrending, 
      trendingPoster: movie.trendingPoster || '', 
      seoTags: movie.seoTags || '' 
    });
    setSelectedGenres(movie.genres || []);
    setSelectedCategories(movie.category || ['Bollywood']);
    const langs = movie.language ? movie.language.split(',').map(l => l.trim()) : ['Hindi'];
    setSelectedLanguages(langs);
    setScreenshots(movie.screenshots.length ? movie.screenshots : ['']);
    setDownloadLinks(movie.downloadLinks.length ? movie.downloadLinks : [{ quality: 'Download Link', size: '', url: '' }]);
    setActiveTab('movies');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTitleBlur = () => {
      // Auto-generate slug when title is entered and slug is empty
      if (formData.title && !formData.slug) {
          setFormData(prev => ({ ...prev, slug: createSlug(formData.title) }));
      }
  };

  const handleDelete = async (id: string) => { 
      if (window.confirm('Delete movie?')) { 
          await deleteMovie(id); 
          refreshData(); 
      } 
  };

  const handleMagicFill = async () => {
    if (!formData.title) { alert("Please enter title!"); return; }
    setIsGenerating(true);
    const data = await generateMovieDetails(formData.title);
    if (data) {
       setFormData(prev => ({ 
           ...prev, 
           year: data.year, 
           description: data.description, 
           qualityTag: data.qualityTag, 
           seoTags: data.seoTags,
           slug: prev.slug || createSlug(formData.title) // Also generate slug if missing
       }));
       if (data.genres) setSelectedGenres(data.genres);
       if (data.language) setSelectedLanguages(data.language.split(',').map(s => s.trim()));
    } else { alert("AI Generation Failed."); }
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return; // Prevent double taps
    
    setIsSaving(true);
    try {
        const moviePayload: Movie = {
            id: editingId || crypto.randomUUID(),
            ...formData,
            // Fallback for slug just in case
            slug: formData.slug || createSlug(formData.title),
            genres: selectedGenres,
            language: selectedLanguages.join(', '),
            category: selectedCategories,
            isTrending: formData.isTrending === true, 
            trendingPoster: formData.isTrending ? formData.trendingPoster : undefined,
            screenshots: screenshots.filter(s => s.trim() !== ''),
            downloadLinks: downloadLinks.filter(l => l.url.trim() !== ''),
            addedAt: editingId ? (movies.find(m => m.id === editingId)?.addedAt || Date.now()) : Date.now(),
            downloadCount: editingId ? (movies.find(m => m.id === editingId)?.downloadCount || 0) : 0,
        };
        
        if (editingId) {
            await updateMovie(moviePayload);
        } else {
            await addMovie(moviePayload);
        }
        
        setSuccess(true);
        refreshData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => { setSuccess(false); resetForm(); }, 1500);
    } catch (err) {
        console.error("Save Error", err);
        alert("Failed to save movie to database.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteRequest = async (id: string) => {
      await deleteRequest(id);
      refreshData();
  };
  
  const handleSaveConfig = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      const success = await saveSiteConfig(config);
      setIsSaving(false);
      if (success) {
        alert("Settings Saved to Cloud!");
      } else {
        alert("Failed to save settings! Please try again or check console.");
      }
  }

  // Memoized helpers for filters & stats
  const trailerStatus = useMemo(() => formData.trailerUrl ? (getYouTubeEmbedUrl(formData.trailerUrl) ? 'valid' : 'invalid') : 'empty', [formData.trailerUrl]);
  
  // Movie List Pagination
  const filteredMovies = useMemo(() => {
      if(!searchTerm) return movies;
      return movies.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [movies, searchTerm]);

  const paginatedMovies = useMemo(() => {
     return filteredMovies.slice((currentPage - 1) * ADMIN_ITEMS_PER_PAGE, currentPage * ADMIN_ITEMS_PER_PAGE);
  }, [filteredMovies, currentPage]);

  const totalPages = Math.ceil(filteredMovies.length / ADMIN_ITEMS_PER_PAGE);

  const dashStats = useMemo(() => {
    const filteredMoviesCount = movies.filter(m => filterByTime(m.addedAt)).length;
    const filteredRequestsCount = requests.filter(r => filterByTime(r.timestamp)).length;
    const totalDownloads = movies.reduce((acc, m) => acc + (m.downloadCount || 0), 0);
    const trendingCount = movies.filter(m => m.isTrending).length;
    const top = [...movies].sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0)).slice(0, 5);
    return { filteredMoviesCount, filteredRequestsCount, totalDownloads, trendingCount, top };
  }, [movies, requests, timeFilter]);

  if (loadingData && movies.length === 0) {
      return <div className="min-h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Loading Admin Panel...</div>
  }

  return (
    <div className="container mx-auto px-2 py-4 max-w-7xl min-h-screen">
      
      {/* Compact Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
           <h1 className="text-2xl font-bold text-white">Admin</h1>
           <button onClick={logout} className="text-xs bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
              <LogOut size={14}/> Exit
           </button>
        </div>
        <div className="flex bg-[#1a1a1a] p-1 rounded-full border border-gray-800 w-full md:w-auto justify-between overflow-x-auto no-scrollbar">
           <button onClick={() => handleTabChange('dashboard')} className={`flex-1 px-4 py-2 rounded-full text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-brand-red text-white' : 'text-gray-400'}`}><LayoutDashboard size={16}/> Dash</button>
           <button onClick={() => handleTabChange('movies')} className={`flex-1 px-4 py-2 rounded-full text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'movies' ? 'bg-brand-red text-white' : 'text-gray-400'}`}><Film size={16}/> Movies</button>
           <button onClick={() => handleTabChange('requests')} className={`flex-1 px-4 py-2 rounded-full text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'requests' ? 'bg-brand-red text-white' : 'text-gray-400'}`}><MessageSquare size={16}/> Req</button>
           <button onClick={() => handleTabChange('settings')} className={`flex-1 px-4 py-2 rounded-full text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-brand-red text-white' : 'text-gray-400'}`}><Settings size={16}/> Config</button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
         <div className="animate-fade-in space-y-4">
            {/* Compact Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
               <div className="bg-brand-card p-4 rounded-xl border border-gray-800 text-center">
                  <Film size={24} className="text-brand-red mb-1 mx-auto"/>
                  <span className="text-2xl font-black text-white block">{dashStats.filteredMoviesCount}</span>
                  <span className="text-gray-500 text-[10px] font-bold uppercase">Movies</span>
               </div>
               <div className="bg-brand-card p-4 rounded-xl border border-gray-800 text-center">
                  <DownloadCloud size={24} className="text-blue-500 mb-1 mx-auto"/>
                  <span className="text-2xl font-black text-white block">{dashStats.totalDownloads}</span>
                  <span className="text-gray-500 text-[10px] font-bold uppercase">Downloads</span>
               </div>
               <div className="bg-brand-card p-4 rounded-xl border border-gray-800 text-center">
                  <MessageSquare size={24} className="text-green-500 mb-1 mx-auto"/>
                  <span className="text-2xl font-black text-white block">{dashStats.filteredRequestsCount}</span>
                  <span className="text-gray-500 text-[10px] font-bold uppercase">Requests</span>
               </div>
               <div className="bg-brand-card p-4 rounded-xl border border-gray-800 text-center">
                  <TrendingUp size={24} className="text-yellow-500 mb-1 mx-auto"/>
                  <span className="text-2xl font-black text-white block">{dashStats.trendingCount}</span>
                  <span className="text-gray-500 text-[10px] font-bold uppercase">Trending</span>
               </div>
            </div>

            {/* Top Movies List - Compact */}
            <div className="bg-brand-card rounded-xl border border-gray-800 p-4">
               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Eye className="text-brand-red" size={18}/> Top Downloads</h3>
               <div className="space-y-2">
                  {dashStats.top.map((m, i) => (
                     <div key={m.id} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-3">
                           <span className={`text-sm font-black w-6 ${i===0?'text-yellow-500':i===1?'text-gray-400':i===2?'text-amber-700':'text-gray-800'}`}>#{i+1}</span>
                           <img src={m.poster} alt="" className="w-8 h-10 object-cover rounded"/>
                           <div className="min-w-0">
                              <div className="text-white font-bold text-xs truncate w-32 md:w-auto">{m.title}</div>
                           </div>
                        </div>
                        <div className="text-brand-red font-bold text-sm">{m.downloadCount || 0}</div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}

      {activeTab === 'movies' && (
        <>
          <div className="bg-brand-card p-4 md:p-6 rounded-xl border border-gray-800 mb-8 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><span className="text-brand-red">{editingId ? 'Edit' : 'Add'}</span> Movie</h2>
              {editingId && <button onClick={resetForm} className="text-xs text-gray-400 bg-gray-800 px-3 py-1.5 rounded-full"><X size={14} className="inline"/> Cancel</button>}
            </div>
            
            {success && <div className="bg-green-600/20 border border-green-500 text-green-400 p-3 rounded-lg mb-4 text-center text-sm font-bold">Saved Successfully!</div>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-4">
                 <div className="flex gap-2 items-end">
                    <div className="flex-grow">
                        <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Movie Title *</label>
                        <input 
                           required 
                           value={formData.title} 
                           onChange={e => setFormData({...formData, title: e.target.value})}
                           onBlur={handleTitleBlur}
                           className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-base focus:border-brand-red outline-none" 
                           placeholder="Movie Name"
                           autoComplete="off"
                        />
                    </div>
                    <button type="button" onClick={handleMagicFill} disabled={isGenerating} className="bg-brand-red/10 border border-brand-red text-brand-red p-3 rounded-lg h-[46px] w-[46px] flex items-center justify-center">
                        {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Wand2 size={20}/>}
                    </button>
                 </div>

                 {/* Slug Field for SEO */}
                 <div>
                    <label className="block text-gray-500 text-xs font-bold uppercase mb-1">URL Slug (SEO)</label>
                    <input 
                       value={formData.slug} 
                       onChange={e => setFormData({...formData, slug: e.target.value})} 
                       className="w-full bg-black border border-gray-700 rounded-lg p-3 text-gray-300 text-sm focus:border-brand-red outline-none font-mono"
                       placeholder="movie-name-2025"
                    />
                    <p className="text-[10px] text-gray-600 mt-1">Leave empty to auto-generate from title</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Year</label>
                        <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-brand-red outline-none"/>
                    </div>
                    <div>
                        <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Quality</label>
                        <input value={formData.qualityTag} onChange={e => setFormData({...formData, qualityTag: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-brand-red outline-none"/>
                    </div>
                 </div>

                 {/* Compact Multi-Selects */}
                 <div className="space-y-3">
                    <div>
                        <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Categories</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORY_LIST.map(cat => (
                                <button key={cat} type="button" onClick={() => toggleSelection(cat, selectedCategories, setSelectedCategories)} className={`text-xs px-3 py-1.5 rounded border ${selectedCategories.includes(cat) ? 'bg-purple-600 border-purple-500 text-white' : 'bg-black border-gray-700 text-gray-400'}`}>{cat}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Language</label>
                        <div className="flex flex-wrap gap-2 h-20 overflow-y-auto border border-gray-800 rounded-lg p-2">
                            {LANGUAGE_LIST.map(lang => (
                                <button key={lang} type="button" onClick={() => toggleSelection(lang, selectedLanguages, setSelectedLanguages)} className={`text-xs px-3 py-1.5 rounded border ${selectedLanguages.includes(lang) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black border-gray-700 text-gray-400'}`}>{lang}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Genres</label>
                        <div className="flex flex-wrap gap-2 h-24 overflow-y-auto border border-gray-800 rounded-lg p-2">
                            {GENRE_LIST.map(g => (
                                <button key={g} type="button" onClick={() => toggleSelection(g, selectedGenres, setSelectedGenres)} className={`text-xs px-3 py-1.5 rounded border ${selectedGenres.includes(g) ? 'bg-brand-red border-brand-red text-white' : 'bg-black border-gray-700 text-gray-400'}`}>{g}</button>
                            ))}
                        </div>
                    </div>
                 </div>

                 <div className="h-px bg-gray-800" />

                 {/* Media Section */}
                 <div>
                    <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Poster URL</label>
                    <input required value={formData.poster} onChange={e => setFormData({...formData, poster: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-brand-red outline-none"/>
                 </div>

                 <div>
                    <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Trailer URL</label>
                    <input value={formData.trailerUrl} onChange={e => setFormData({...formData, trailerUrl: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-brand-red outline-none"/>
                 </div>
                 
                 <div className="flex items-center gap-3 p-3 bg-black rounded-lg border border-gray-800" onClick={() => setFormData(prev => ({...prev, isTrending: !prev.isTrending}))}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.isTrending ? 'bg-brand-red border-brand-red' : 'border-gray-600'}`}>
                        {formData.isTrending && <CheckCircle size={14} className="text-white"/>}
                    </div>
                    <span className="text-sm font-bold text-gray-300">Mark as Trending</span>
                 </div>
                 
                 {formData.isTrending && (
                     <div>
                        <label className="block text-brand-red text-xs font-bold uppercase mb-1">Wide Banner URL</label>
                        <input value={formData.trendingPoster} onChange={e => setFormData({...formData, trendingPoster: e.target.value})} className="w-full bg-black border border-brand-red/50 rounded-lg p-3 text-white text-sm focus:border-brand-red outline-none"/>
                     </div>
                 )}
                 
                 {/* Screenshots */}
                 <div>
                    <label className="block text-gray-500 text-xs font-bold uppercase mb-2">Screenshots</label>
                    <div className="space-y-2">
                        {screenshots.map((s, i) => (
                            <input key={i} value={s} onChange={(e) => handleScreenshotChange(i, e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-2 text-white text-xs focus:border-brand-red outline-none" placeholder={`URL ${i+1}`}/>
                        ))}
                    </div>
                    <button type="button" onClick={addScreenshotField} className="mt-2 text-xs bg-gray-800 text-white px-3 py-1.5 rounded">+ Add More</button>
                 </div>

                 <div className="h-px bg-gray-800" />
                 
                 {/* Links Section */}
                 <div>
                     <label className="block text-gray-500 text-xs font-bold uppercase mb-1">Description</label>
                     <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-brand-red outline-none"/>
                 </div>
                 
                 {/* SEO Tags Input - Restored */}
                 <div>
                    <label className="block text-gray-500 text-xs font-bold uppercase mb-1">SEO Keywords / Tags</label>
                    <textarea 
                        rows={2} 
                        value={formData.seoTags} 
                        onChange={e => setFormData({...formData, seoTags: e.target.value})} 
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-brand-red outline-none"
                        placeholder="Action, 2024, Full Movie, Download"
                    />
                    <p className="text-[10px] text-gray-600">These will be used for the clickable Tag system.</p>
                 </div>
                 
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-gray-500 text-xs font-bold uppercase">Download Links</label>
                        <button type="button" onClick={addLinkField} className="text-xs bg-brand-red text-white px-2 py-1 rounded">Add</button>
                    </div>
                    {downloadLinks.map((l, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                            <input value={l.url} onChange={(e) => handleLinkChange(i, 'url', e.target.value)} className="flex-grow bg-black border border-gray-700 rounded-lg p-2 text-white text-xs" placeholder="URL"/>
                            <input value={l.quality} onChange={(e) => handleLinkChange(i, 'quality', e.target.value)} className="w-24 bg-black border border-gray-700 rounded-lg p-2 text-white text-xs" placeholder="Name"/>
                            <button type="button" onClick={() => removeLinkField(i)} className="text-red-500"><Trash size={16}/></button>
                        </div>
                    ))}
                 </div>
               </div>

               <button 
                  type="submit" 
                  disabled={isSaving} 
                  className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg text-lg sticky bottom-4 z-20"
               >
                   {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} 
                   {isSaving ? 'Saving...' : (editingId ? 'Update' : 'Publish')}
               </button>
            </form>
          </div>

          <div className="bg-brand-card p-4 rounded-xl border border-gray-800">
             <div className="flex justify-between mb-4 items-center">
                <h2 className="text-lg font-bold text-white">Database</h2>
                <input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Search..." className="bg-black border border-gray-700 rounded-full px-4 py-2 text-white text-xs focus:border-brand-red outline-none w-32"/>
             </div>
             <div className="space-y-2">
                {paginatedMovies.map(m => (
                   <div key={m.id} className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-gray-800">
                      <div className="flex items-center gap-3 overflow-hidden">
                         <img src={m.poster} className="w-8 h-10 object-cover rounded" alt=""/>
                         <div className="min-w-0">
                             <span className="text-white text-sm font-bold truncate block">{m.title}</span>
                             <span className="text-[10px] text-gray-500 font-mono">{m.slug}</span>
                         </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                         <button onClick={() => handleEdit(m)} className="text-blue-400 bg-blue-900/20 p-2 rounded"><Edit2 size={16}/></button>
                         <button onClick={() => handleDelete(m.id)} className="text-red-400 bg-red-900/20 p-2 rounded"><Trash size={16}/></button>
                      </div>
                   </div>
                ))}
             </div>
             {totalPages > 1 && (
               <div className="flex justify-center items-center gap-4 mt-6">
                 <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-black rounded border border-gray-700 disabled:opacity-30"><ChevronLeft size={20}/></button>
                 <span className="text-sm text-gray-400">{currentPage}/{totalPages}</span>
                 <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-black rounded border border-gray-700 disabled:opacity-30"><ChevronRight size={20}/></button>
               </div>
             )}
          </div>
        </>
      )}

      {activeTab === 'requests' && (
        <div className="bg-brand-card p-4 rounded-xl border border-gray-800 animate-fade-in">
           <h2 className="text-xl font-bold text-white mb-4">Requests</h2>
           {requests.length === 0 ? <p className="text-gray-600 text-sm">Empty.</p> :
             <div className="space-y-3">
               {requests.filter(r => filterByTime(r.timestamp)).map(req => (
                 <div key={req.id} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-gray-800">
                   <div><h3 className="text-white font-bold text-sm">{req.movieName}</h3><p className="text-[10px] text-gray-500">{new Date(req.timestamp).toLocaleDateString()}</p></div>
                   <button onClick={() => handleDeleteRequest(req.id)} className="text-red-400 bg-red-900/20 p-2 rounded"><Trash size={16}/></button>
                 </div>
               ))}
             </div>
           }
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-brand-card p-6 rounded-xl border border-gray-800 animate-fade-in">
           <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
           <form onSubmit={handleSaveConfig} className="space-y-4">
              <div><label className="block text-gray-400 text-xs font-bold mb-1">How to Download Link</label><input type="url" value={config.howToDownloadUrl} onChange={(e) => setConfig({...config, howToDownloadUrl: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-brand-red outline-none"/></div>
              <div><label className="block text-gray-400 text-xs font-bold mb-1">Telegram Link</label><input type="url" value={config.telegramUrl} onChange={(e) => setConfig({...config, telegramUrl: e.target.value})} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-brand-red outline-none"/></div>
              <button type="submit" disabled={isSaving} className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} Save
              </button>
           </form>
        </div>
      )}
    </div>
  );
};
