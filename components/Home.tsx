
import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';

interface HomeProps {
  onEnterHall: () => void;
}

export const Home: React.FC<HomeProps> = ({ onEnterHall }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-[#1a0202] cny-pattern">
      {/* Cinematic Parallax Clouds */}
      <div className="absolute inset-0 pointer-events-none opacity-20 drifting-clouds">
        <div className="absolute top-1/4 left-0 w-full h-[400px] bg-gradient-to-b from-transparent via-[#8b0000] to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-full h-[300px] bg-gradient-to-b from-transparent via-[#d4af37] to-transparent blur-3xl rounded-full" />
      </div>

      {/* Decorative Cloud SVGs (simulated) */}
      <div className="absolute top-20 left-10 opacity-30 drifting-clouds" style={{ animationDuration: '45s' }}>
        <span className="text-8xl text-[#d4af37]/20 serif">☁️</span>
      </div>
      <div className="absolute bottom-40 right-20 opacity-30 drifting-clouds" style={{ animationDirection: 'reverse', animationDuration: '60s' }}>
        <span className="text-9xl text-[#d4af37]/10 serif">☁️</span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center flex flex-col items-center px-6 animate-fade-in-up">
        <div className="mb-6 flex flex-col items-center">
           <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mb-4" />
           <p className="text-[#d4af37] text-xs md:text-sm font-black uppercase tracking-[0.8em] md:tracking-[1.2em] mb-2 drop-shadow-lg">Vitrox College Presents</p>
           <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mt-4" />
        </div>

        <h1 className="text-5xl md:text-9xl font-serif font-black text-[#fef9c3] tracking-tighter text-gold-glow uppercase mb-4 leading-none">
          Thundering<br/><span className="text-red-600">Hooves</span>
        </h1>
        
        <div className="flex items-center gap-6 mb-10">
           <div className="h-[1px] w-12 bg-[#d4af37]/40" />
           <p className="text-4xl md:text-6xl brush-font text-[#d4af37] drop-shadow-2xl">万马奔腾</p>
           <div className="h-[1px] w-12 bg-[#d4af37]/40" />
        </div>

        <div className="bg-black/40 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 mb-12">
          <p className="text-[#fef9c3] text-sm md:text-xl font-serif font-bold tracking-widest uppercase flex items-center gap-4">
             12TH FEB 2026 <span className="opacity-40 font-thin text-2xl">|</span> 6:00PM - 9:30PM
          </p>
        </div>

        {/* CTA Button */}
        <button 
          onClick={onEnterHall}
          className="group relative px-12 py-6 bg-gradient-to-r from-[#d4af37] via-[#fff176] to-[#d4af37] text-[#5c1a1a] rounded-full font-black uppercase text-sm md:text-base tracking-[0.3em] shadow-[0_25px_60px_rgba(212,175,55,0.4)] transition-all hover:scale-110 active:scale-95 animate-glow-pulse flex items-center gap-4 border-4 border-white/50"
        >
          Enter the Hall & Book Seats
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Background Glow */}
      <div className="absolute inset-0 z-0 bg-radial-gradient from-transparent via-transparent to-[#0a0101]" />
    </div>
  );
};
