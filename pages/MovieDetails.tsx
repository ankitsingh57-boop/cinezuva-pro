import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieBySlug, getMovieById, getRelatedMovies, incrementDownloadCount, getSiteConfig } from '../services/storage';
import { Movie, SiteConfig } from '../types';
import { Download, Monitor, Info, Youtube, Calendar, Globe, Layers, Film, Hash, HardDrive, CircleHelp, Home, AlertCircle } from 'lucide-react';
import { MovieCard } from '../components/MovieCard';
import { getYouTubeEmbedUrl } from '../utils/video';

export const MovieDetails: React.FC = () => {
  // Params will capture the slug from the URL e.g. /avengers-endgame or /12345
  const { slug } = useParams<{ slug: string }>();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [related, setRelated] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (slug) {
        setLoading(true);
        window.scrollTo(0, 0);
        try {
          // 1. Try fetching by slug (SEO URL)
          let foundMovie = await getMovieBySlug(slug);
          
          // 2. Fallback: If not found, try fetching by ID (Legacy URL)
          if (!foundMovie) {
             foundMovie = await getMovieById(slug);
          }

          const siteConfig = await getSiteConfig();
          setConfig(siteConfig);
          
          if (foundMovie) {
            setMovie(foundMovie);
            const rel = await getRelatedMovies(foundMovie.category, foundMovie.id);
            setRelated(rel);
            
            // --- SEO & META TAG OPTIMIZATION ---
            const currentUrl = window.location.href;
            const pageTitle = `Download ${foundMovie.title} (${foundMovie.year}) ${foundMovie.qualityTag} - Cinezuva`;
            
            // Set Document Title
            document.title = pageTitle;
            
            // Meta Description
            const metaDescription = `Download ${foundMovie.title} (${foundMovie.year}) full movie in ${foundMovie.qualityTag} ${foundMovie.language}. ${foundMovie.description ? foundMovie.description.substring(0, 120) : ''}... Fast Google Drive Download Links on Cinezuva.`;
            
            // Keywords
            const keywords = `${foundMovie.title} download, ${foundMovie.title} movie, ${foundMovie.title} ${foundMovie.year}, ${foundMovie.language} movie download, 4k movies, cinezuva, ${foundMovie.seoTags}`;

            // Helper to set meta tags
            const setMeta = (name: string, content: string, isProp: boolean = false) => {
                let element = document.querySelector(isProp ? `meta[property="${name}"]` : `meta[name="${name}"]`);
                if (!element) {
                    element = document.createElement('meta');
                    element.setAttribute(isProp ? 'property' : 'name', name);
                    document.head.appendChild(element);
                }
                element.setAttribute('content', content);
            };

            // Set Meta Tags
            setMeta('description', metaDescription);
            setMeta('keywords', keywords);

            // Canonical Link
            let canonical = document.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.setAttribute('rel', 'canonical');
                document.head.appendChild(canonical);
            }
            canonical.setAttribute('href', currentUrl);

            // Open Graph
            setMeta('og:title', pageTitle, true);
            setMeta('og:description', metaDescription, true);
            setMeta('og:image', foundMovie.poster, true);
            setMeta('og:url', currentUrl, true);
            setMeta('og:type', 'video.movie', true);

            // Schema.org Structured Data (JSON-LD)
            const schemaData = {
              "@context": "https://schema.org",
              "@type": "Movie",
              "name": foundMovie.title,
              "image": foundMovie.poster,
              "datePublished": foundMovie.year,
              "description": foundMovie.description,
              "genre": foundMovie.genres,
              "inLanguage": foundMovie.language,
              "url": currentUrl,
              "aggregateRating": {
                 "@type": "AggregateRating",
                 "ratingValue": "4.8",
                 "ratingCount": foundMovie.downloadCount ? foundMovie.downloadCount + 100 : 100
              }
            };

            let script = document.getElementById('movie-schema') as HTMLScriptElement;
            if (!script) {
               script = document.createElement('script');
               script.id = 'movie-schema';
               script.type = 'application/ld+json';
               document.head.appendChild(script);
            }
            script.textContent = JSON.stringify(schemaData);
          } else {
            setMovie(null);
          }
        } catch (e) {
          console.error(e);
          setMovie(null);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMovieDetails();
  }, [slug]);

  const handleDownloadClick = async () => {
    if (movie) incrementDownloadCount(movie.id).catch(console.error);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
           <p className="text-gray-400">Loading movie...</p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!movie) {
      return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-white p-6 text-center animate-fade-in">
            <div className="bg-white/5 p-6 rounded-full mb-6">
                <AlertCircle size={48} className="text-brand-red opacity-80"/>
            </div>
            <h1 className="text-3xl font-bold mb-3">Movie Not Found</h1>
            <p className="text-gray-400 mb-8 max-w-md">The movie you are looking for might have been removed, or the link is incorrect.</p>
            <Link to="/" className="bg-brand-red hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg flex items-center gap-2">
                <Home size={20}/> Go Home
            </Link>
        </div>
      );
  }

  const embedUrl = getYouTubeEmbedUrl(movie.trailerUrl);

  return (
    <div className="animate-fade-in bg-[#050505] overflow-x-hidden">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
         <img src={movie.poster} alt="bg" className="w-full h-full object-cover opacity-20 blur-3xl scale-125"/>
         <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/95 to-[#050505]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-8 md:pt-12 mb-8">
         {/* Breadcrumb - SEO Optimized */}
         <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 font-medium">
             <Link to="/" className="hover:text-brand-red transition-colors">Home</Link>
             <span>/</span>
             <Link to={`/category/${movie.category[0]}`} className="hover:text-brand-red transition-colors">{movie.category[0]}</Link>
             <span>/</span>
             <span className="text-gray-300 truncate max-w-[150px]">{movie.title}</span>
         </div>

         <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
            
            {/* LEFT: POSTER */}
            <div className="w-full md:w-[300px] lg:w-[350px] flex-shrink-0 flex flex-col gap-4 mx-auto md:mx-0 md:sticky md:top-24">
               <div className="relative group rounded-xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-white/10">
                  <img 
                    src={movie.poster} 
                    alt={movie.title} 
                    className="w-full h-auto object-cover" 
                    loading="eager" 
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-4 right-[-30px] rotate-45 bg-brand-red text-white text-[10px] font-black px-10 py-1 shadow-lg uppercase tracking-widest">{movie.qualityTag}</div>
               </div>
            </div>

            {/* RIGHT: CONTENT */}
            <div className="flex-grow w-full">
               
               {/* Header Info */}
               <div className="mb-8 text-center md:text-left">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-2xl">{movie.title}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                     {movie.genres && movie.genres.map(g => (
                        <Link key={g} to={`/genre/${g}`} className="text-xs font-bold text-white bg-brand-red/80 px-3 py-1 rounded-full uppercase tracking-wider hover:bg-white hover:text-brand-red transition-colors">{g}</Link>
                     ))}
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-gray-300 font-medium bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                     <span className="flex items-center gap-2"><Calendar size={16} className="text-brand-red"/> {movie.year}</span>
                     <span className="w-px h-4 bg-gray-700"></span>
                     <span className="flex items-center gap-2"><Globe size={16} className="text-blue-400"/> {movie.language}</span>
                     <span className="w-px h-4 bg-gray-700"></span>
                     {movie.category.map(c => (
                        <span key={c} className="flex items-center gap-2"><Layers size={16} className="text-gray-400"/> {c}</span>
                     ))}
                  </div>
               </div>

               {/* Screenshots */}
               {movie.screenshots && movie.screenshots.length > 0 && (
                  <div className="mb-10 animate-fade-in-up delay-100">
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800 pb-2"><Monitor className="text-brand-red" size={20}/> Screenshots</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {movie.screenshots.map((shot, i) => (
                           <div key={i} className="rounded-lg overflow-hidden border border-white/10 shadow-lg bg-black hover:scale-[1.02] transition-transform duration-300 group"><img src={shot} className="w-full h-auto object-contain group-hover:opacity-80 transition-opacity" loading="lazy" alt="screenshot"/></div>
                        ))}
                     </div>
                  </div>
               )}

               {/* Trailer */}
               {embedUrl && (
                  <div id="trailer-section" className="mb-10 animate-fade-in-up delay-200">
                     <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800 pb-2"><Youtube className="text-red-500" size={20}/> Official Trailer</h3>
                     <div className="rounded-xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-black aspect-video w-full">
                        <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="trailer"></iframe>
                     </div>
                  </div>
               )}

               {/* Description */}
               {movie.description && movie.description.trim() !== '' && (
                  <div className="mb-8 animate-fade-in-up delay-300 bg-white/5 p-4 rounded-xl border border-white/5">
                     <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Info className="text-brand-red" size={20}/> Synopsis</h3>
                     <p className="text-gray-300 leading-relaxed font-light text-base opacity-90">{movie.description}</p>
                  </div>
               )}
               
               {/* How To Download Button */}
               {config?.howToDownloadUrl && (
                  <div className="mb-6 animate-fade-in-up">
                     <a 
                       href={config.howToDownloadUrl} 
                       target="_blank" 
                       rel="noreferrer"
                       className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.3)] transition-all transform hover:scale-105 text-xs uppercase tracking-wide"
                     >
                       <CircleHelp size={16} className="text-black"/> How To Download
                     </a>
                  </div>
               )}

               {/* Download Buttons */}
               {movie.downloadLinks && movie.downloadLinks.length > 0 && (
                  <div id="downloads" className="mb-8 animate-fade-in-up delay-400">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="bg-brand-red p-2 rounded-lg"><Download className="text-white" size={20}/></div>
                        <div><h3 className="text-xl font-bold text-white">Download Links</h3><p className="text-[10px] text-gray-500">Fast & Secure Servers</p></div>
                     </div>
                     
                     <div className="flex flex-col gap-2">
                        {movie.downloadLinks.map((link, i) => (
                           <a 
                              key={i} 
                              href={link.url} 
                              target="_blank" 
                              rel="noreferrer"
                              onClick={handleDownloadClick}
                              className="bg-brand-red hover:bg-red-700 text-white font-bold text-base py-3 px-6 rounded-lg shadow-lg hover:shadow-red-900/50 transition-all text-center flex items-center justify-center gap-3 group border border-red-500/50"
                           >
                              <HardDrive size={18} className="group-hover:animate-bounce"/>
                              <span>{link.quality || "Download Link"}</span>
                           </a>
                        ))}
                     </div>
                  </div>
               )}

               {/* Interactive Tags Section */}
               {movie.seoTags && movie.seoTags.trim() !== '' && (
                  <div className="mb-4 bg-[#0a0a0a] p-3 rounded-xl border border-white/5 animate-fade-in-up delay-500 transition-opacity">
                     <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-2"><Hash size={12}/> Tags</h4>
                     <div className="flex flex-wrap gap-2">
                        {movie.seoTags.split(',').map((tag, i) => {
                           const cleanTag = tag.trim();
                           if(!cleanTag) return null;
                           return (
                             <Link 
                               key={i} 
                               to={`/tag/${encodeURIComponent(cleanTag)}`}
                               className="text-[10px] text-gray-400 bg-white/5 hover:bg-brand-red hover:text-white border border-white/5 px-2 py-1 rounded-md transition-colors"
                             >
                               {cleanTag}
                             </Link>
                           );
                        })}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* Recommended Section */}
      <div className="bg-[#020202] border-t border-gray-900 pt-6 pb-8 relative z-10 mt-0">
         <div className="container mx-auto px-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Film size={18} className="text-gray-500"/> Recommended For You</h3>
            {related.length > 0 ? (
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-5">
                  {related.map(m => <MovieCard key={m.id} movie={m} />)}
               </div>
            ) : (
               <p className="text-gray-600 italic text-sm">No similar movies found.</p>
            )}
         </div>
      </div>

    </div>
  );
};