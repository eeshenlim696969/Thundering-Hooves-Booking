import React from 'react';
import { ChevronRight, Gift, Zap } from 'lucide-react';

interface HomeProps {
  onEnterHall: () => void;
}

export const Home: React.FC<HomeProps> = ({ onEnterHall }) => {
  return (
    // REMOVED: complex 'cny-pattern' class if it was causing CSS lag
    // ADDED: Hardware acceleration hints via 'transform-gpu'
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#1a0202] py-20 overflow-x-hidden transform-gpu">
      
      {/* SIMPLIFIED BACKGROUND: Removed blur-3xl gradients which are GPU killers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/assets/cny-pattern.webp')] opacity-5 mix-blend-screen" />
        <div className="absolute inset-0 bg-radial-gradient from-red-900/20 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center flex flex-col items-center px-6 w-full max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col items-center">
           <div className="w-20 h-[1px] bg-[#d4af37] mb-4 opacity-50" />
           <p className="text-[#d4af37] text-xs md:text-sm font-black uppercase tracking-[0.8em] md:tracking-[1.2em]">
             Vitrox College Presents
           </p>
           <div className="w-20 h-[1px] bg-[#d4af37] mt-4 opacity-50" />
        </div>

        {/* TYPOGRAPHY: Simplified shadow to 'drop-shadow-md' for better performance */}
        <h1 className="text-6xl md:text-9xl font-serif font-black text-[#fef9c3] tracking-tighter uppercase mb-4 leading-none drop-shadow-2xl">
          Thundering<br/><span className="text-red-600">Hooves</span>
        </h1>
        
        <div className="flex items-center gap-6 mb-8 justify-center">
           <div className="h-[1px] w-12 bg-[#d4af37]/40" />
           <p className="text-4xl md:text-6xl text-[#d4af37] italic">万马奔腾</p>
           <div className="h-[1px] w-12 bg-[#d4af37]/40" />
        </div>

        {/* --- OPTIMIZED OFFER BADGE --- */}
        <div className="relative mb-10 transform-gpu">
           {/* Static Glow instead of Pulse to save CPU */}
           <div className="absolute inset-0 bg-red-600/30 blur-xl rounded-full" />
           
           <div className="relative bg-[#3d0000] border-2 border-[#d4af37] px-8 py-4 rounded-xl flex flex-col md:flex-row items-center gap-4">
              <Gift className="w-6 h-6 text-[#d4af37]" />
              <div className="flex flex-col items-center">
                <span className="text-[#d4af37] text-[10px] font-black uppercase tracking-widest">CNY Special Promotion</span>
                <span className="text-white text-2xl md:text-3xl font-black italic">
                  BUY 2 <span className="text-[#d4af37]">FREE 1</span>
                </span>
                <span className="text-white/40 text-[9px] uppercase tracking-tighter mt-1">
                  *Applicable to same-tier seats
                </span>
              </div>
              <Zap className="w-6 h-6 text-[#d4af37] hidden md:block" />
           </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm px-8 py-4 rounded-lg border border-white/5 mb-12">
          <p className="text-[#fef9c3] text-sm md:text-xl font-serif font-bold tracking-widest uppercase">
            12TH FEB 2026 <span className="mx-4 opacity-30">|</span> 6:00PM - 9:30PM
          </p>
        </div>

        {/* INSTANT CTA: No blast logic, just the trigger */}
        <button 
          onClick={onEnterHall}
          className="group relative px-12 py-6 bg-[#d4af37] text-[#1a0202] rounded-full font-black uppercase text-sm md:text-lg tracking-widest transition-all hover:brightness-110 active:scale-95 flex items-center gap-4"
        >
          Enter the Hall & Book Seats
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* EC / CLUB INFO: Added for impact */}
      <div className="mt-20 opacity-40 text-[10px] tracking-[0.4em] uppercase text-[#d4af37]">
        Music & Performing Arts Club • EC 2026
      </div>
    </div>
  );
};
