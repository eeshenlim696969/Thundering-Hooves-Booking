import React, { useState, useRef, useEffect } from 'react';
import { SeatData, SeatStatus, SeatTier } from '../types';
import { User, Lock, Clock, Loader2, Leaf, Utensils } from 'lucide-react';

interface SeatProps {
  data: SeatData;
  color: string;
  onClick: (id: string) => void;
  isSelected: boolean;
  isLockedByOther: boolean;
  style?: React.CSSProperties;
  className?: string;
  isAdmin?: boolean;
}

const CLICK_SOUND_URL = 'https://www.soundjay.com/misc/sounds/bubble-pop-1.mp3';

export const Seat: React.FC<SeatProps> = ({ data, color, onClick, isSelected, isLockedByOther, style, className, isAdmin }) => {
  const { status, tableId, seatNumber, tier, paymentInfo } = data;
  
  // FORCE TABLE 4 TO 3A FIX
  const displayTableId = tableId === '4' || tableId === 4 ? '3A' : tableId;

  const [waves, setWaves] = useState<{ id: number; color: string }[]>([]);
  const [isPopping, setIsPopping] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(CLICK_SOUND_URL);
    audioRef.current.volume = 0.5;
  }, []);

  const handleSeatClick = () => {
    if (status === SeatStatus.AVAILABLE || isSelected || isAdmin) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setIsPopping(true);
      setTimeout(() => setIsPopping(false), 300);
      const id = Date.now();
      const waveColor = tier === SeatTier.PLATINUM ? '#ff0000' : tier === SeatTier.GOLD ? '#ffd700' : '#ffffff';
      setWaves(prev => [...prev, { id, color: waveColor }]);
      setTimeout(() => setWaves(prev => prev.filter(w => w.id !== id)), 600);
      onClick(data.id);
    }
  };

  const baseClasses = "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 text-[14px] font-black select-none shadow-md border-[2px] relative group hover:scale-110 active:scale-95 z-10 hover:z-[100]";
  
  const Tooltip = () => (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[135%] mb-2 hidden group-hover:block z-[999] pointer-events-none origin-bottom animate-slide-up">
      <div className="bg-[#111] text-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/10 whitespace-nowrap flex flex-col overflow-hidden min-w-[200px] p-5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            <span className="text-white/40 text-[9px] uppercase font-black tracking-widest">Position</span>
            <span className="text-sm font-black text-white uppercase tracking-tight">Table {displayTableId} • Seat {seatNumber}</span>
          </div>
          <div className="text-right">
             <span className="text-white/40 text-[9px] uppercase font-black tracking-widest">Price</span>
             <p className="font-black text-[#d4af37] font-mono text-base leading-none">RM{data.price.toFixed(2)}</p>
          </div>
        </div>
        {isAdmin && paymentInfo && (
          <div className="mb-3 p-3 bg-white/5 rounded-xl border border-white/5">
             <p className="text-[10px] font-black text-[#d4af37] uppercase tracking-wider truncate mb-1">{paymentInfo.studentName}</p>
             <div className="flex items-center gap-2 text-[8px] font-bold text-white/40 uppercase">
                {paymentInfo.isVegan ? <Leaf className="w-2.5 h-2.5 text-green-400" /> : <Utensils className="w-2.5 h-2.5 text-blue-400" />}
                {paymentInfo.isVegan ? 'Vegan Preference' : 'Standard Meal'}
             </div>
          </div>
        )}
        <div className="h-[1px] w-full bg-white/10 mb-3" />
        <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${status === SeatStatus.AVAILABLE ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-[10px] uppercase font-black text-white/80 tracking-widest">Status Verified</span>
        </div>
      </div>
      <div className="w-3 h-3 bg-[#111] rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1.5 border-r border-b border-white/10"></div>
    </div>
  );

  return (
    <button
      onClick={handleSeatClick}
      style={{ ...style, borderColor: isSelected ? undefined : color }}
      className={`${baseClasses} ${isSelected ? "bg-[#5c1a1a] text-[#fef9c3]" : "bg-white text-stone-700"} ${isPopping ? 'animate-seat-pop' : ''}`}
    >
        <Tooltip />
        {isSelected ? <User className="w-5 h-5 animate-pulse" /> : seatNumber}
    </button>
  );
};
