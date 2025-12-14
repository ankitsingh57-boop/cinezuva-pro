import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 text-center animate-cin-intro">
         <h1 className="text-6xl md:text-9xl font-black tracking-tighter drop-shadow-[0_0_25px_rgba(229,9,20,0.6)]">
            <span className="text-white">CINE</span>
            <span className="text-brand-red">ZUVA</span>
         </h1>
         <div className="mt-6 flex justify-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
         </div>
         <p className="text-gray-500 text-xs uppercase tracking-[0.5em] mt-8 font-bold animate-pulse">
            Premium HD Movies
         </p>
      </div>
      
      {/* Cinematic Spotlight Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-red/10 via-black to-black opacity-80 pointer-events-none"></div>
    </div>
  );
};