
import React from 'react';
import { Music, Ticket, Settings, Home as HomeIcon } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'hall' | 'admin' | 'cart';
  onNavigate: (view: 'home' | 'hall' | 'admin' | 'cart') => void;
  isAdmin: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, isAdmin }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm border-b border-white/5 px-6 py-4 md:py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo / Title */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-[#5c1a1a] border border-[#d4af37]/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Music className="w-6 h-6 text-[#d4af37]" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-white font-serif font-black text-sm uppercase tracking-widest leading-none">Thundering Hooves</h2>
            <p className="text-[8px] text-[#d4af37] font-black uppercase tracking-[0.4em] mt-1">Vitrox Music Club</p>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={() => onNavigate('home')}
            className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${currentView === 'home' ? 'text-[#d4af37]' : 'text-white/60 hover:text-white'}`}
          >
            <HomeIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Home</span>
          </button>

          <button 
            onClick={() => onNavigate('hall')}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${currentView === 'hall' ? 'bg-[#d4af37] text-[#5c1a1a] scale-105' : 'bg-red-700 text-white hover:bg-red-800'}`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Hall (Booking)</span>
          </button>

          <button 
            onClick={() => onNavigate('admin')}
            className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${currentView === 'admin' ? 'text-[#d4af37]' : 'text-white/20 hover:text-white/60'}`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Admin</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
