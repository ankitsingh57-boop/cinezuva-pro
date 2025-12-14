import React, { useState, useEffect } from 'react';
import { Plus, Download, Send, MessageSquarePlus, X } from 'lucide-react';
import { addRequest, getSiteConfig } from '../services/storage';
import { useLocation } from 'react-router-dom';

export const FloatingMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [movieName, setMovieName] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [config, setConfig] = useState({ howToDownloadUrl: '', telegramUrl: '' });
  const location = useLocation();
  
  useEffect(() => {
    const fetchConfig = async () => {
      const c = await getSiteConfig();
      setConfig(c);
    };
    fetchConfig();
  }, [location.pathname]);

  // HIDE MENU ON ADMIN AND LOGIN PAGES
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/login')) {
      return null;
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (movieName.trim()) {
      await addRequest(movieName);
      setMovieName('');
      setRequestSent(true);
      setTimeout(() => {
        setRequestSent(false);
        setShowRequestModal(false);
        setIsOpen(false);
      }, 2000);
    }
  };

  const handleLinkClick = (url: string) => {
     if (url && url.trim() !== '') {
       window.open(url, '_blank');
       setIsOpen(false);
     } else {
       alert("Link not configured by Admin yet.");
     }
  };

  return (
    <>
      {/* Floating Button Group */}
      <div className="fixed bottom-8 right-6 z-50 flex flex-col items-end gap-4">
        
        {/* Menu Items with Staggered Animation */}
        <div className={`flex flex-col gap-4 items-end transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100 visible' : 'translate-y-10 opacity-0 invisible'}`}>
          
          <div 
            className="flex items-center gap-3 animate-fade-in-up cursor-pointer group" 
            style={{ animationDelay: '0ms' }}
            onClick={() => handleLinkClick(config.howToDownloadUrl)}
          >
             <span className="bg-white text-black text-sm font-bold px-4 py-2 rounded-full shadow-lg transform transition-transform group-hover:scale-105 active:scale-95">
               How to Download
             </span>
             <div className="bg-gray-900/90 backdrop-blur-md text-white p-3 rounded-full shadow-lg border border-white/10 group-hover:bg-brand-red group-hover:border-brand-red transition-all group-hover:scale-110">
               <Download size={20} />
             </div>
          </div>

          <div 
            className="flex items-center gap-3 animate-fade-in-up cursor-pointer group" 
            style={{ animationDelay: '50ms' }}
            onClick={() => handleLinkClick(config.telegramUrl)}
          >
             <span className="bg-white text-black text-sm font-bold px-4 py-2 rounded-full shadow-lg transform transition-transform group-hover:scale-105 active:scale-95">
               Join Community
             </span>
             <div className="bg-gray-900/90 backdrop-blur-md text-white p-3 rounded-full shadow-lg border border-white/10 group-hover:bg-[#0088cc] group-hover:border-[#0088cc] transition-all group-hover:scale-110">
               <Send size={20} />
             </div>
          </div>

          <div 
            className="flex items-center gap-3 animate-fade-in-up cursor-pointer group" 
            style={{ animationDelay: '100ms' }}
            onClick={() => setShowRequestModal(true)}
          >
             <span className="bg-white text-black text-sm font-bold px-4 py-2 rounded-full shadow-lg transform transition-transform group-hover:scale-105 active:scale-95">
               Request Movie
             </span>
             <div className="bg-gray-900/90 backdrop-blur-md text-white p-3 rounded-full shadow-lg border border-white/10 group-hover:bg-purple-600 group-hover:border-purple-600 transition-all group-hover:scale-110">
               <MessageSquarePlus size={20} />
             </div>
          </div>
        </div>

        {/* Main Toggle Button with Glow Effect */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group bg-gradient-to-br from-brand-red to-red-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ${isOpen ? 'rotate-45 scale-110' : 'rotate-0'}`}
        >
          {/* Breathing Glow Ring */}
          <span className="absolute inset-0 rounded-full bg-brand-red opacity-50 animate-ping group-hover:opacity-30"></span>
          <span className="relative z-10 block">
             <Plus size={28} />
          </span>
        </button>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-card border border-gray-700 w-full max-w-md p-6 rounded-2xl shadow-2xl relative">
            <button onClick={() => setShowRequestModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-2">Request A Movie</h3>
            <p className="text-gray-400 text-sm mb-6">Can't find what you're looking for? Let us know!</p>
            
            {requestSent ? (
              <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-xl text-center font-medium">
                Request Sent Successfully! 🚀
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit}>
                <label className="block text-xs text-gray-500 uppercase font-bold mb-2">Movie Name</label>
                <input 
                  type="text" 
                  value={movieName}
                  onChange={(e) => setMovieName(e.target.value)}
                  placeholder="e.g. Iron Man 3"
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-brand-red outline-none mb-4"
                  autoFocus
                />
                <button type="submit" className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg">
                  Send Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};