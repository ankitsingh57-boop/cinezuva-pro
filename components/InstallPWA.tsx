import React, { useState, useEffect } from 'react';
import { X, Smartphone } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
        setIsVisible(false);
        return;
    }

    // Check if we already captured the event in index.html script before React mounted
    if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
        setIsVisible(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
      (window as any).deferredPrompt = e; // Sync with global
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
      console.log('PWA was installed');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
        setIsVisible(false);
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
    }
  };

  // Condition to show: Event fired + User is on Home or Movie Details Page
  const isAllowedPage = location.pathname === '/' || location.pathname.startsWith('/movie/');
  
  if (!isVisible || !isAllowedPage) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[90] animate-fade-in-up">
      <div className="bg-brand-red text-white p-1 rounded-xl shadow-[0_0_20px_rgba(229,9,20,0.5)] flex items-center gap-2 pr-4 relative border border-white/20">
         <button 
           onClick={() => setIsVisible(false)} 
           className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 border border-gray-700 shadow-sm z-10 hover:scale-110 transition-transform"
         >
           <X size={12} />
         </button>
         
         <div className="bg-black/20 p-3 rounded-lg">
            <Smartphone size={24} className="animate-pulse" />
         </div>
         <div className="cursor-pointer" onClick={handleInstallClick}>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-90 text-gray-200">Get App</div>
            <div className="font-black text-sm leading-none">INSTALL NOW</div>
         </div>
      </div>
    </div>
  );
};