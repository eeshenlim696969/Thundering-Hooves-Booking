
import React, { useState, useEffect, useRef } from 'react';
import { Download, Sparkles, Share2, Ticket as TicketIcon, X, Check, Trophy, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { SeatData } from '../types';

interface DigitalAngpaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  seats: SeatData[];
}

const BLESSINGS = [
  "Abundance flows into your life like the thundering tides!",
  "May your path be paved with gold and golden opportunities!",
  "A majestic stride towards a year of soaring achievements!",
  "Wishing you harmony, health, and imperial prosperity!",
  "May the fire of the stallion ignite your spirit with joy!"
];

export const DigitalAngpaoModal: React.FC<DigitalAngpaoModalProps> = ({ isOpen, onClose, seats }) => {
  const [opened, setOpened] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState<Record<string, boolean>>({});
  const [showContent, setShowContent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setOpened(true), 800);
      const contentTimer = setTimeout(() => setShowContent(true), 2400); 
      return () => {
        clearTimeout(timer);
        clearTimeout(contentTimer);
      };
    } else {
      setOpened(false);
      setDownloaded({});
      setShowContent(false);
      setActiveIdx(0);
    }
  }, [isOpen]);

  if (!isOpen || seats.length === 0) return null;

  const currentSeat = seats[activeIdx];
  const blessing = BLESSINGS[currentSeat.tableId % BLESSINGS.length];

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      if (document.fonts) await document.fonts.ready;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scale = 3;
      const w = 600;
      const h = 900;
      canvas.width = w * scale;
      canvas.height = h * scale;
      ctx.scale(scale, scale);

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#5c1a1a'); 
      grad.addColorStop(1, '#2d0606');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      }

      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 12;
      ctx.strokeRect(20, 20, w - 40, h - 40);
      ctx.lineWidth = 2;
      ctx.strokeRect(35, 35, w - 70, h - 70);

      ctx.fillStyle = '#fef9c3';
      ctx.textAlign = 'center';
      ctx.font = '900 18px Inter';
      ctx.fillText('VITROX MUSIC & PERFORMING ARTS CLUB', w / 2, 85);
      ctx.font = '900 42px Noto Serif SC';
      ctx.fillStyle = '#d4af37';
      ctx.fillText('IMPERIAL PASS', w / 2, 145);

      ctx.fillStyle = '#fef9c3';
      ctx.font = '900 24px Inter';
      ctx.fillText('POSITION DETAILS', w / 2, 230);
      ctx.font = '900 120px Noto Serif SC';
      ctx.fillStyle = '#fff';
      ctx.fillText(`TABLE ${currentSeat.tableId}`, w / 2, 380);
      
      ctx.shadowBlur = 30; ctx.shadowColor = '#d4af37';
      ctx.font = '900 280px Inter';
      ctx.fillStyle = '#d4af37';
      ctx.fillText(`#${currentSeat.seatNumber}`, w / 2, 650);
      ctx.shadowBlur = 0;

      ctx.font = 'italic 700 24px Noto Serif SC';
      ctx.fillStyle = '#fef9c3';
      const words = blessing.split(' ');
      let line = ''; let y = 740;
      for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        if (testLine.length > 30) {
          ctx.fillText(line, w / 2, y);
          line = words[n] + ' '; y += 35;
        } else { line = testLine; }
      }
      ctx.fillText(line, w / 2, y);

      ctx.font = '900 14px Inter';
      ctx.fillStyle = '#d4af37';
      ctx.fillText('PRESENT THIS DIGITAL PASS AT THE ENTRANCE', w / 2, 860);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `Pass_T${currentSeat.tableId}_S${currentSeat.seatNumber}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
        setDownloaded(prev => ({ ...prev, [currentSeat.id]: true }));
      }, 'image/png');
    } catch (err) { alert("Registration Error: Could not generate pass image."); } finally { setDownloading(false); }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-stone-950 animate-fade-in overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {/* Decorative Layer - High Contrast & Clean */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_40%,#5c1a1a_0%,#0a0101_80%)] opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-amber-400/5 blur-[120px]" />
      </div>

      {/* Close Action */}
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 z-[3000] p-4 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all backdrop-blur-md border border-white/10 active:scale-90"
      >
        <X className="w-8 h-8" />
      </button>

      {showContent && (
        <div className="relative z-[2100] w-full max-w-sm px-6 flex flex-col items-center text-center animate-slide-up">
           <div className="mb-8">
             <div className="flex items-center justify-center gap-2 text-amber-500 font-black uppercase text-[10px] tracking-[0.6em] mb-4">
               <Sparkles className="w-4 h-4" />
               Prosperity Revealed
               <Sparkles className="w-4 h-4" />
             </div>
             <p className="text-white/40 uppercase font-black text-[10px] tracking-widest mb-1">Assigned Hall Position</p>
             <h2 className="text-white font-serif font-black text-4xl tracking-widest uppercase mb-1">Table {currentSeat.tableId}</h2>
             <div className="text-[120px] md:text-[140px] font-black text-[#d4af37] leading-none drop-shadow-[0_0_50px_rgba(212,175,55,0.4)]">
               #{currentSeat.seatNumber}
             </div>
           </div>

           <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 mb-10 shadow-2xl">
              <p className="text-[#fef9c3] font-serif italic text-lg leading-relaxed px-2">
                "{blessing}"
              </p>
           </div>

           {seats.length > 1 && (
             <div className="flex items-center gap-8 mb-10 p-4 bg-black/40 rounded-full border border-white/5 shadow-inner">
                <button 
                  disabled={activeIdx === 0}
                  onClick={() => setActiveIdx(prev => prev - 1)}
                  className="p-3 bg-white/5 rounded-full disabled:opacity-10 text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Pass</span>
                   <span className="text-sm font-black text-white">{activeIdx + 1} / {seats.length}</span>
                </div>
                <button 
                  disabled={activeIdx === seats.length - 1}
                  onClick={() => setActiveIdx(prev => prev + 1)}
                  className="p-3 bg-white/5 rounded-full disabled:opacity-10 text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
             </div>
           )}

           <div className="w-full space-y-4">
             <button 
               onClick={handleDownload}
               disabled={downloading}
               className="w-full py-6 bg-[#d4af37] text-[#5c1a1a] rounded-[24px] font-black uppercase text-xs tracking-[0.3em] shadow-[0_20px_60px_rgba(212,175,55,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
             >
               {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : (downloaded[currentSeat.id] ? <Check className="w-5 h-5" /> : <Download className="w-5 h-5" />)}
               {downloading ? 'Preparing Pass...' : (downloaded[currentSeat.id] ? 'Digital Pass Saved' : `Save Pass #${currentSeat.seatNumber}`)}
             </button>
             
             <button 
               onClick={() => {
                 navigator.clipboard.writeText(`I'm seated at Table ${currentSeat.tableId} Seat ${currentSeat.seatNumber} for Thundering Hooves! 🧧🐎`);
                 alert("Prosperity status copied to clipboard!");
               }}
               className="w-full py-4 text-white/40 hover:text-white font-black uppercase text-[9px] tracking-[0.4em] flex items-center justify-center gap-2 transition-all hover:bg-white/5 rounded-xl"
             >
               <Share2 className="w-4 h-4" /> Share My Fortune
             </button>
           </div>
        </div>
      )}
    </div>
  );
};
