
import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';

interface ImperialAnnouncementProps {
  onEnter: () => void;
}

// CRITICAL FIX: Update target date to Feb 12, 2026
const TARGET_DATE = new Date('2026-02-12T18:00:00').getTime();

export const ImperialAnnouncement: React.FC<ImperialAnnouncementProps> = ({ onEnter }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = TARGET_DATE - now;
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
      });
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); 
    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    if (isClosing) return;
    setShowFireworks(true);
    document.body.classList.add('thundering-rumble');
    setIsClosing(true);
    setTimeout(() => {
      document.body.classList.remove('thundering-rumble');
      onEnter();
    }, 1200);
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-4 select-none">
      <div 
        className={`absolute inset-0 bg-black/95 backdrop-blur-3xl transition-opacity duration-700 z-0 ${isClosing ? 'opacity-0' : 'opacity-100'}`} 
      />
      
      {showFireworks && (
        <div className="absolute inset-0 flex items-center justify-center z-[10005] pointer-events-none">
           <div className="firework-burst" style={{ '--fw-color': '#ffd700' } as React.CSSProperties} />
           <div className="firework-burst scale-150 -translate-x-32" style={{ '--fw-color': '#ff4d00' } as React.CSSProperties} />
           <div className="firework-burst scale-150 translate-x-32" style={{ '--fw-color': '#ff4d00' } as React.CSSProperties} />
           <div className="firework-burst scale-125 translate-y-40" style={{ '--fw-color': '#ffffff' } as React.CSSProperties} />
        </div>
      )}

      <div className={`relative flex flex-col items-center w-full max-w-[460px] z-[10010] transition-all duration-700 ${isClosing ? 'scale-90 opacity-0 pointer-events-none' : 'scale-100 opacity-100 pointer-events-auto'}`}>
        <div className="w-full h-10 md:h-12 bg-gradient-to-r from-[#2d0606] via-[#5c1a1a] to-[#2d0606] rounded-full shadow-2xl relative z-30 border-b-2 border-[#d4af37] flex items-center justify-between px-4">
           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8b6b10] border-2 border-[#2d0606] flex items-center justify-center font-black text-[#5c1a1a] text-[10px]">福</div>
           <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37] animate-pulse" />
           </div>
           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8b6b10] border-2 border-[#2d0606] flex items-center justify-center font-black text-[#5c1a1a] text-[10px]">福</div>
        </div>

        <div 
          className={`w-[92%] bg-[#fdf6e3] border-x-[12px] md:border-x-[16px] border-[#d4af37] relative transition-all duration-1000 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ${isClosing ? 'scroll-roll-up-active' : 'scroll-unroll-active'}`}
          style={{ 
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper-2.png")',
            height: '80vh'
          }}
        >
          <div className="absolute inset-0 border-[2px] border-[#5c1a1a]/10 m-2 pointer-events-none z-10" />
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 flex flex-col items-center text-center relative z-0">
             <div className="mb-4 shrink-0">
                <div className="text-[#5c1a1a] text-4xl md:text-6xl brush-font leading-none mb-1">Vitrox</div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-[#5c1a1a]/60">Music & Performing Arts</span>
                </div>
             </div>

             <div className="space-y-4 md:space-y-6 py-4 shrink-0">
                <p className="text-[#5c1a1a] text-base md:text-lg font-serif font-black tracking-tight leading-snug">
                  Imperial Symphonic Night
                </p>
                <div className="relative">
                  <p className="text-[#5c1a1a] text-3xl md:text-5xl brush-font tracking-[0.1em] leading-tight">
                    Thundering Hooves
                  </p>
                </div>
                
                <div className="py-3 px-6 bg-[#5c1a1a]/5 rounded-2xl border border-[#5c1a1a]/10">
                  {timeLeft ? (
                    <div className="flex flex-col items-center">
                       <p className="text-[8px] font-black text-[#5c1a1a]/40 uppercase tracking-[0.3em] mb-2 font-serif">Hype Countdown</p>
                       <div className="text-sm md:text-xl font-serif font-black text-[#5c1a1a] tracking-wider flex items-center gap-2">
                         <span>{timeLeft.d} Days</span>
                         <span className="opacity-30">:</span>
                         <span>{timeLeft.h} Hours</span>
                         <span className="opacity-30">:</span>
                         <span>{timeLeft.m} Minutes</span>
                       </div>
                    </div>
                  ) : (
                    <p className="text-xl font-serif font-black text-[#8b0000] animate-pulse">The Show Has Begun!</p>
                  )}
                </div>

                <p className="text-[#5c1a1a] text-[10px] md:text-xs font-serif font-black italic opacity-80 uppercase tracking-[0.2em]">
                  Grand CNY Celebration
                </p>
             </div>

             <div className="mt-6 text-[#5c1a1a] text-xs md:text-sm leading-relaxed font-serif space-y-4 max-w-[300px]">
                <p>Welcome to the digital portal of the Thundering Hooves CNY Concert. Select your seats with care to witness a night of musical excellence.</p>
                <div className="h-[1px] w-12 bg-[#5c1a1a]/20 mx-auto" />
                
                <div className="bg-[#5c1a1a]/5 p-5 rounded-2xl border-2 border-dashed border-[#5c1a1a]/10">
                  <p className="font-black mb-3 text-[#5c1a1a] uppercase text-[10px] tracking-widest">Event Schedule</p>
                  <ul className="text-[10px] uppercase tracking-[0.15em] font-black opacity-80 space-y-3">
                    <li className="flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a1a]/20" />
                      6:00 PM - Hall Doors Open (Arrival)
                    </li>
                    <li className="text-base md:text-xl text-[#d4af37] drop-shadow-sm flex flex-col items-center justify-center">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-black">6:30 PM</span>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] uppercase tracking-[0.2em] font-black text-[#5c1a1a]/60">Opening Ceremony Begins</span>
                    </li>
                    <li className="flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5c1a1a]/20" />
                      9:30 PM - Grand Finale
                    </li>
                  </ul>
                </div>
                <div className="h-[1px] w-12 bg-[#5c1a1a]/20 mx-auto" />
                <p className="text-[10px] italic">Thundering prosperity to all attendees.</p>
             </div>
             
             <div className="mt-10 pb-12 w-full flex flex-col items-center">
                <button 
                  onClick={handleClose}
                  className="px-10 md:px-14 py-4 md:py-5 bg-[#5c1a1a] text-[#fdf6e3] rounded-2xl font-black uppercase text-[11px] md:text-xs tracking-[0.4em] shadow-[0_15px_40px_rgba(92,26,26,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#d4af37]/30 flex items-center gap-3"
                >
                  Enter Hall <ChevronDown className="w-4 h-4 animate-bounce" />
                </button>
             </div>
          </div>
        </div>

        <div className="w-full h-10 md:h-12 bg-gradient-to-r from-[#2d0606] via-[#5c1a1a] to-[#2d0606] rounded-full shadow-2xl relative z-30 border-t-2 border-[#d4af37] flex items-center justify-between px-4">
           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8b6b10] border-2 border-[#2d0606]" />
           <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/40" />
              <div className="w-16 md:w-20 h-1 bg-[#d4af37]/20 rounded-full" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/40" />
           </div>
           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8b6b10] border-2 border-[#2d0606]" />
        </div>
      </div>
    </div>
  );
};
