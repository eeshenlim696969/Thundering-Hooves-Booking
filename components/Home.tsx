import React from 'react';
import { Sparkles, ChevronRight, Gift, Zap } from 'lucide-react';

interface HomeProps {
  onEnterHall: () => void;
}

export const Home: React.FC<HomeProps> = ({ onEnterHall }) => {
  return (
    // FIX: Changed h-screen to min-h-screen and removed overflow-hidden so it scrolls on small screens
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#1a0202] cny-pattern py-20">
      
      {/* Cinematic Parallax Clouds (Fixed Position to stay in background while scrolling) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 drifting-clouds overflow-hidden">
        <div className="absolute top-1/4 left-0 w-full h-[400px] bg-gradient-to-b from-transparent via-[#8b0000] to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-full h-[300px] bg-gradient-to-b from-transparent via-[#d4af37] to-transparent blur-3xl rounded-full" />
      </div>

      {/* Decorative Cloud SVGs */}
      <div className="absolute top-20 left-10 opacity-30 drifting-clouds" style={{ animationDuration: '45s' }}>
        <span className="text-8xl text-[#d4af37]/20 serif">☁️</span>
      </div>
      <div className="absolute bottom-40 right-20 opacity-30 drifting-clouds" style={{ animationDirection: 'reverse', animationDuration: '60s' }}>
        <span className="text-9xl text-[#d4af37]/10 serif">☁️</span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center flex flex-col items-center px-6 animate-fade-in-up w-full max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col items-center">
           <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mb-4" />
           <p className="text-[#d4af37] text-xs md:text-sm font-black uppercase tracking-[0.8em] md:tracking-[1.2em] mb-2 drop-shadow-lg text-center">Vitrox College Presents</p>
           <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mt-4" />
        </div>

        <h1 className="text-5xl md:text-9xl font-serif font-black text-[#fef9c3] tracking-tighter text-gold-glow uppercase mb-4 leading-none break-words text-center">
          Thundering<br/><span className="text-red-600">Hooves</span>
        </h1>
        
        <div className="flex items-center gap-6 mb-8 flex-wrap justify-center">
           <div className="h-[1px] w-12 bg-[#d4af37]/40" />
           <p className="text-3xl md:text-6xl brush-font text-[#d4af37] drop-shadow-2xl">万马奔腾</p>
           <div className="h-[1px] w-12 bg-[#d4af37]/40" />
        </div>

        {/* --- GLOWING OFFER BADGE --- */}
        <div className="relative group cursor-default mb-10 transform hover:scale-105 transition-transform duration-500 max-w-[90vw]">
           {/* Blurry Glow Background */}
           <div className="absolute inset-0 bg-red-600 blur-2xl opacity-60 animate-pulse rounded-full"></div>
           
           {/* The Badge */}
           <div className="relative bg-gradient-to-r from-[#5c1a1a] via-[#8b0000] to-[#5c1a1a] border-2 border-[#d4af37] px-6 md:px-8 py-4 rounded-full shadow-[0_0_40px_rgba(212,175,55,0.4)] flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <Gift className="w-6 h-6 md:w-8 md:h-8 text-[#d4af37] animate-bounce" />
              <div className="flex flex-col items-center">
                <span className="text-[#d4af37] text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-1 text-center">CNY Special Promotion</span>
                <span className="text-white text-xl md:text-3xl font-black italic tracking-tighter drop-shadow-md text-center whitespace-nowrap">
                  BUY 2 <span className="text-[#d4af37]">FREE 1</span>
                </span>
                <span className="text-white/50 text-[8px] md:text-[9px] uppercase tracking-wider font-bold mt-1 text-center">*Applicable to same-tier seats</span>
              </div>
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-[#d4af37] animate-pulse hidden md:block" />
           </div>
        </div>
        {/* ------------------------------- */}

        <div className="bg-black/40 backdrop-blur-md px-6 md:px-8 py-4 rounded-2xl border border-white/10 mb-12 max-w-full">
          <p className="text-[#fef9c3] text-xs md:text-xl font-serif font-bold tracking-widest uppercase flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center">
             <span>12TH FEB 2026</span>
             <span className="hidden md:inline opacity-40 font-thin text-2xl">|</span>
             <span>6:00PM - 9:30PM</span>
          </p>
        </div>

        {/* CTA Button */}
        <button 
          onClick={onEnterHall}
          className="group relative px-8 md:px-12 py-5 md:py-6 bg-gradient-to-r from-[#d4af37] via-[#fff176] to-[#d4af37] text-[#5c1a1a] rounded-full font-black uppercase text-xs md:text-base tracking-[0.2em] md:tracking-[0.3em] shadow-[0_25px_60px_rgba(212,175,55,0.4)] transition-all hover:scale-110 active:scale-95 animate-glow-pulse flex items-center gap-4 border-4 border-white/50 whitespace-normal text-center leading-relaxed"
        >
          Enter the Hall & Book Seats
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>
      </div>

      {/* Background Glow */}
      <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent via-transparent to-[#0a0101]" />
    </div>
  );
};
