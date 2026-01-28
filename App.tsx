import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SeatData, SeatStatus, SeatTier, ConcertConfig, SeatDetail } from './types';
import { Seat } from './components/Seat';
import { PaymentModal } from './components/PaymentModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { submitBookingRequest, subscribeToSeats, submitBatchBookingRequest, deleteBooking } from './services/firebase';
import { AuthModal } from './components/AuthModal';
import { DigitalAngpaoModal } from './components/DigitalAngpaoModal';
import { AdminSeatDetailsModal } from './components/AdminSeatDetailsModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ImperialAnnouncement } from './components/ImperialAnnouncement';
import { Home } from './components/Home';
import { Navbar } from './components/Navbar';
import { 
  RefreshCw, 
  Trash2, Flame, Sparkles, ShoppingBag, ChevronLeft, Star,
  LogOut, Ticket, X, Zap, Trophy, Gift
} from 'lucide-react';

const MEMBER_DISCOUNT_AMOUNT = 1.00;
const LOCK_DURATION_SECONDS = 300; 

type AuraType = 'PLATINUM' | 'GOLD' | 'SILVER';

interface AuraData {
  type: AuraType;
  title: string;
  icon: string;
  message: string;
  colorClass: string;
  glowClass: string;
}

const AURA_CONFIG: Record<AuraType, AuraData> = {
  PLATINUM: {
    type: 'PLATINUM',
    title: '🔥 CELESTIAL FIRE HORSE 🔥',
    icon: '🐎',
    message: 'Such wonderful luck! You possess a fortune so rare, you must bring this energy to our next event to bless us all!',
    colorClass: 'holographic-bg text-blue-900',
    glowClass: 'shadow-[0_0_80px_rgba(147,197,253,1)]',
  },
  GOLD: {
    type: 'GOLD',
    title: '🐉 MYSTIC GOLD DRAGON 🐉',
    icon: '🐲',
    message: 'Your fortune is accumulating! By attending tonight, you will gain even MORE luck and prosperity after this event.',
    colorClass: 'bg-gradient-to-br from-amber-400 via-yellow-200 to-amber-600 text-amber-950',
    glowClass: 'shadow-[0_0_60px_rgba(251,191,36,0.9)]',
  },
  SILVER: {
    type: 'SILVER',
    title: '⚡ SWIFT SILVER TIGER ⚡',
    icon: '🐅',
    message: 'Your destiny is changing! Simply by joining this event, your luck is about to SKYROCKET to the moon!',
    colorClass: 'bg-gradient-to-br from-stone-400 via-stone-100 to-stone-500 text-stone-900',
    glowClass: 'shadow-[0_0_50px_rgba(214,211,209,0.8)]',
  }
};

// --- UPDATED PRICES (Gold 10.88, Silver 8.88) ---
const DEFAULT_PRICES = {
  [SeatTier.PLATINUM]: 0, 
  [SeatTier.GOLD]: 10.88,
  [SeatTier.SILVER]: 8.88,
};

const BASE_CONFIG: ConcertConfig = {
  totalTables: 14,
  // We keep the layout count (6, 4, 4) to preserve the grid structure
  section1Count: 6, 
  section2Count: 4, 
  section3Count: 4,
  seatsPerTable: 6,
  tiers: {
    [SeatTier.PLATINUM]: { price: 0, color: '#b91c1c', label: 'Platinum' },      
    [SeatTier.GOLD]: { price: DEFAULT_PRICES[SeatTier.GOLD], color: '#d97706', label: 'Golden Tier' }, 
    [SeatTier.SILVER]: { price: DEFAULT_PRICES[SeatTier.SILVER], color: '#57534e', label: 'Silver Tier' }, 
  },
  payment: {
    tngQrUrl: 'https://drive.google.com/thumbnail?id=17jpYGYSTDCZmvWYFTCZgSj1ND_jJa4r9&sz=w1000',
    bankAccountName: 'Teow Boon Keong',
    bankAccountNumber: '157223400182',
    bankName: 'Maybank',
  }
};

const Stage = () => (
  <div className="w-full max-w-4xl mx-auto mb-20 relative px-4 mt-8">
    <div className="h-28 md:h-40 bg-gradient-to-b from-stone-900 to-stone-950 rounded-t-[100px] border-x-[15px] md:border-x-[40px] border-stone-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden relative group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.2)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-[#d4af37]/40 shadow-[0_0_15px_#d4af37]" />
      
      <div className="flex flex-col items-center gap-2 relative z-10">
        <div className="flex items-center gap-4 text-[#d4af37]">
          <Trophy className="w-5 h-5 md:w-7 md:h-7 animate-pulse" />
          <h3 className="font-serif font-black text-xl md:text-5xl tracking-[0.4em] uppercase text-gold-glow">
            MAIN STAGE
          </h3>
          <Trophy className="w-5 h-5 md:w-7 md:h-7 animate-pulse" />
        </div>
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
      </div>
    </div>
    <div className="absolute -bottom-10 left-0 right-0 h-56 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(212,175,55,0.18)_0%,transparent_100%)] pointer-events-none" />
  </div>
);

const SectionHeader: React.FC<{ tier: SeatTier, label: string }> = ({ tier, label }) => {
  // Always use GOLD styling for Platinum visual override
  const visualTier = label.includes("GOLD") ? SeatTier.GOLD : tier;

  const icon = visualTier === SeatTier.PLATINUM ? <Flame className="w-5 h-5 md:w-8 md:h-8 fill-current" /> : 
               visualTier === SeatTier.GOLD ? <Star className="w-5 h-5 md:w-8 md:h-8 fill-current" /> : 
               <Sparkles className="w-5 h-5 md:w-8 md:h-8" />;
               
  const gradient = visualTier === SeatTier.PLATINUM ? "from-[#8b0000] via-red-600 to-[#8b0000] text-white" :
                   visualTier === SeatTier.GOLD ? "from-[#d4af37] via-[#fef9c3] to-[#d4af37] text-[#5c1a1a]" :
                   "from-[#57534e] via-stone-300 to-[#57534e] text-white";

  return (
    <div className="flex flex-col items-center w-full relative z-[5] gap-4 mt-12 mb-6 pointer-events-none px-4 text-center">
      <div className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 border-white/20 bg-gradient-to-r ${gradient} transform scale-90 md:scale-100 shadow-xl backdrop-blur-sm`}>
         <div className="animate-pulse shrink-0">{icon}</div>
         <span className="text-xs md:text-xl font-black uppercase tracking-[0.15em] font-serif whitespace-nowrap drop-shadow-md">
           {label}
         </span>
         <div className="animate-pulse shrink-0">{icon}</div>
      </div>
    </div>
  );
};

const RoundTable: React.FC<{
  tableId: number;
  seats: SeatData[];
  tier: SeatTier;
  config: ConcertConfig;
  mySelectedIds: string[];
  onSeatClick: (id: string) => void;
  isAdmin?: boolean;
  spinningSeatId?: string | null;
}> = ({ tableId, seats, tier, config, mySelectedIds, onSeatClick, isAdmin, spinningSeatId }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const containerSize = isMobile ? 180 : 240; 
  const center = containerSize / 2;
  const baseRadius = isMobile ? 60 : 80; 
  
  // Force visual color to GOLD if it's the top section (tables 1-6)
  const tierColor = (tier === SeatTier.PLATINUM || tier === SeatTier.GOLD) 
    ? config.tiers[SeatTier.GOLD].color 
    : config.tiers[SeatTier.SILVER].color;

  const displaySeats = useMemo(() => [...seats].sort((a, b) => a.seatNumber - b.seatNumber).slice(0, config.seatsPerTable), [seats, config.seatsPerTable]);
  const isSoldOut = displaySeats.length > 0 && displaySeats.every(s => s.status === SeatStatus.SOLD);

  return (
    <div className="relative select-none transition-transform hover:scale-105 duration-500 shrink-0 z-10 mx-auto" style={{ width: containerSize, height: containerSize }}>
       {isSoldOut && (
         <div className="absolute inset-0 m-auto w-32 h-32 md:w-44 md:h-44 bg-amber-400/20 blur-[40px] md:blur-[60px] animate-pulse rounded-full z-0 opacity-80" />
       )}
       
       <div className={`absolute inset-0 m-auto w-20 h-20 md:w-28 md:h-28 rounded-full border-[4px] md:border-[6px] flex flex-col items-center justify-center shadow-2xl z-10 bg-white transition-all ${isSoldOut ? 'shadow-[0_0_40px_rgba(212,175,55,0.7)]' : ''}`}
         style={{ borderColor: isSoldOut ? '#d4af37' : tierColor }}>
          <span className="text-[6px] md:text-[7px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#d4af37]">{isSoldOut ? 'SOLD OUT' : 'TABLE'}</span>
          <span className={`text-xl md:text-4xl font-serif font-black ${isSoldOut ? 'text-[#d4af37]' : 'text-stone-900'}`}>{tableId === 4 ? '3A' : tableId}</span>
       </div>
       {displaySeats.map((seat) => {
         const angle = ((seat.seatNumber - 1) / config.seatsPerTable) * 2 * Math.PI - (Math.PI / 2);
         const isSpinningHighlight = spinningSeatId === seat.id;
         return (
           <div key={seat.id} className="absolute z-20" style={{ left: center + baseRadius * Math.cos(angle), top: center + baseRadius * Math.sin(angle), transform: 'translate(-50%, -50%)' }}>
             <Seat 
               data={{...seat, tableId: (seat.tableId === 4 ? '3A' : seat.tableId)} as any} 
               color={tierColor} 
               isSelected={mySelectedIds.includes(seat.id)} 
               isLockedByOther={seat.status !== SeatStatus.AVAILABLE && !mySelectedIds.includes(seat.id)} 
               onClick={onSeatClick} 
               isAdmin={isAdmin}
               className={`w-10 h-10 md:w-12 md:h-12 ${isSpinningHighlight ? '!bg-yellow-400 !border-white scale-150 z-[100] shadow-[0_0_30px_#facc15]' : ''}`}
             />
           </div>
         );
       })}
    </div>
  );
};

export const App: React.FC = () => {
  const [currentUserId] = useState(() => {
    let id = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('concert_user_id') : null;
    if (!id) { id = Math.random().toString(36).substring(2, 9); if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('concert_user_id', id); }
    return id;
  });

  const [tierPrices, setTierPrices] = useState<Record<SeatTier, number>>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('thundering_prices');
      if (saved) return JSON.parse(saved);
    }
    return DEFAULT_PRICES;
  });

  const config = useMemo(() => ({
    ...BASE_CONFIG,
    tiers: {
      [SeatTier.PLATINUM]: { ...BASE_CONFIG.tiers[SeatTier.PLATINUM], price: tierPrices[SeatTier.PLATINUM] },
      [SeatTier.GOLD]: { ...BASE_CONFIG.tiers[SeatTier.GOLD], price: tierPrices[SeatTier.GOLD] },
      [SeatTier.SILVER]: { ...BASE_CONFIG.tiers[SeatTier.SILVER], price: tierPrices[SeatTier.SILVER] },
    }
  }), [tierPrices]);

  const handleUpdatePrices = (newPrices: Record<SeatTier, number>) => {
    setTierPrices(newPrices);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('thundering_prices', JSON.stringify(newPrices));
    }
  };

  const [seats, setSeats] = useState<SeatData[]>([]);
  const [mySelectedIds, setMySelectedIds] = useState<string[]>([]);
  const seatsRef = useRef<SeatData[]>([]);

  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [view, setView] = useState<'home' | 'hall' | 'admin' | 'cart'>('home');
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isAuthOpen, setAuthOpen] = useState(false);
  const [isAngpaoOpen, setAngpaoOpen] = useState(false);
  const [bookedSeats, setBookedSeats] = useState<SeatData[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingDetails, setPendingDetails] = useState<Record<string, SeatDetail>>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedAdminSeat, setSelectedAdminSeat] = useState<SeatData | null>(null);

  const [timeLeft, setTimeLeft] = useState(LOCK_DURATION_SECONDS); 
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Gacha Logic
  const [showGachaModal, setShowGachaModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningAura, setSpinningAura] = useState<AuraType>('SILVER');
  const [auraResult, setAuraResult] = useState<AuraType | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [coinBurst, setCoinBurst] = useState(false);
  const [spinningSeatId, setSpinningSeatId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('thundering_hooves_aura') as AuraType | null;
    if (saved && AURA_CONFIG[saved]) {
      setAuraResult(saved);
    }
  }, []);

  const triggerAuraResult = (res: AuraType) => {
    setAuraResult(res);
    setShowGachaModal(true);
    setIsSpinning(false);

    if (res === 'PLATINUM') {
      setShowFireworks(true);
      document.body.classList.add('thundering-rumble');
      setTimeout(() => {
        setShowFireworks(false);
        document.body.classList.remove('thundering-rumble');
      }, 3000);
    } else if (res === 'GOLD') {
      setCoinBurst(true);
      setTimeout(() => setCoinBurst(false), 3000);
    }
  };

  const handleTestLuck = () => {
    if (auraResult) {
      setShowGachaModal(true);
      return;
    }
    setShowGachaModal(true);
    setIsSpinning(true);
    
    const types: AuraType[] = ['SILVER', 'GOLD', 'PLATINUM'];
    let cycleCount = 0;
    const interval = setInterval(() => {
      setSpinningAura(types[cycleCount % 3]);
      cycleCount++;
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const rand = Math.random();
      let res: AuraType = rand < 0.05 ? 'PLATINUM' : rand < 0.40 ? 'GOLD' : 'SILVER';
      triggerAuraResult(res);
      localStorage.setItem('thundering_hooves_aura', res);
    }, 3000);
  };

  const mySelectedSeats = useMemo(() => seats.filter(s => mySelectedIds.includes(s.id)), [seats, mySelectedIds]);
  
  const seatsByTable = useMemo<Record<number, SeatData[]>>(() => {
    const map: Record<number, SeatData[]> = {};
    seats.forEach(s => {
      if (!map[s.tableId]) map[s.tableId] = [];
      map[s.tableId].push(s);
    });
    return map;
  }, [seats]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToSeats((cloudSeats) => {
      setSeats(prevSeats => {
        let initialSeats: SeatData[] = prevSeats.length > 0 ? [...prevSeats] : [];
        if (initialSeats.length === 0) {
           for (let t = 1; t <= config.totalTables; t++) {
             // Logic: T1-10 = GOLD, T11-14 = SILVER
             // Even though we keep section1Count for layout, we force the DATA tier here.
             let tier = SeatTier.SILVER;
             if (t <= 10) tier = SeatTier.GOLD; 
             
             for (let s = 1; s <= config.seatsPerTable; s++) {
               initialSeats.push({ 
                 id: `t${t}-s${s}`, 
                 tableId: t, 
                 seatNumber: s, 
                 status: SeatStatus.AVAILABLE, 
                 tier, 
                 price: config.tiers[tier].price 
                });
             }
           }
        }

        return initialSeats.map(localSeat => {
          const cloudData = cloudSeats[localSeat.id];
          const currentPrice = config.tiers[localSeat.tier].price;
          
          if (cloudData) {
            const rawStatus = String(cloudData.status || 'AVAILABLE').toUpperCase();
            let mappedStatus = rawStatus as SeatStatus;
            return {
              ...localSeat,
              price: currentPrice,
              status: mappedStatus,
              lockedBy: cloudData.lockedBy || undefined,
              lockedAt: cloudData.lockedAt || undefined,
              paymentInfo: cloudData.paymentInfo || undefined
            };
          }
          return { ...localSeat, price: currentPrice };
        });
      });
      setLoading(false);
    });
    return () => unsubscribe(); 
  }, [config]);

  useEffect(() => {
    if (seats.length > 0 && currentUserId) {
       const recoveredSeats = seats.filter(s => s.status === SeatStatus.CHECKOUT && s.lockedBy === currentUserId);
       if (recoveredSeats.length > 0) {
         const recoveredIds = recoveredSeats.map(s => s.id);
         setMySelectedIds(prev => Array.from(new Set([...prev, ...recoveredIds])));
         const lockTime = recoveredSeats[0].lockedAt || Date.now();
         const elapsedSeconds = Math.floor((Date.now() - lockTime) / 1000);
         const remaining = LOCK_DURATION_SECONDS - elapsedSeconds;
         if (remaining > 0) {
             setTimeLeft(remaining);
             setIsTimerActive(true);
         } else {
             handleCheckoutCleanup();
         }
       }
    }
  }, [seats, currentUserId, view]);

  const handleCheckoutCleanup = useCallback(async () => {
    setIsTimerActive(false);
    try {
      const idsToReset = [...mySelectedIds];
      if (idsToReset.length > 0) {
        const bookings = idsToReset.map(id => ({
          seatId: id,
          data: {
            status: SeatStatus.AVAILABLE,
            lockedAt: null,
            lockedBy: null,
            paymentInfo: null
          }
        }));
        await submitBatchBookingRequest(bookings);
      }
    } catch (e) {
      console.error("Cleanup failed:", e);
    } finally {
      setMySelectedIds([]);
      setConfirmOpen(false);
      setPaymentOpen(false);
    }
  }, [mySelectedIds]);

  useEffect(() => {
    let timerId: number;
    if (isTimerActive && timeLeft > 0) {
      timerId = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleCheckoutCleanup(); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [isTimerActive, timeLeft, handleCheckoutCleanup]);

  useEffect(() => { seatsRef.current = seats; }, [seats]);

  const handleSeatClick = useCallback(async (id: string) => {
    const target = seatsRef.current.find(s => s.id === id);
    if (!target) return;
    if (isAdmin) { setSelectedAdminSeat(target); return; }
    if (target.status === SeatStatus.AVAILABLE) {
      setMySelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else if (mySelectedIds.includes(id)) {
      setMySelectedIds(prev => prev.filter(i => i !== id));
    }
  }, [isAdmin, mySelectedIds]);

  const handleProceedToCheckout = async (targetIds?: string[]) => {
    const ids = targetIds || mySelectedIds;
    if (ids.length === 0) return;
    setLoading(true);
    try {
      const now = Date.now();
      const bookings = ids.map(id => ({
        seatId: id,
        data: {
          status: SeatStatus.CHECKOUT,
          lockedAt: now,
          lockedBy: currentUserId
        }
      }));
      await submitBatchBookingRequest(bookings);
      setTimeLeft(LOCK_DURATION_SECONDS); 
      setIsTimerActive(true);
      setConfirmOpen(true);
    } catch (e) {
      console.error("Securing seats failed:", e);
      alert("Imperial Notice: Error securing your seats. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRandomPick = () => {
    const available = seats.filter(s => s.status === SeatStatus.AVAILABLE);
    if (available.length === 0) {
      alert("Hall is full! No available seats for a random pick.");
      return;
    }
    const duration = 6000; 
    const intervalTime = 500;
    const iterations = duration / intervalTime;
    let count = 0;
    const timer = setInterval(() => {
      const randomSeat = available[Math.floor(Math.random() * available.length)];
      setSpinningSeatId(randomSeat.id);
      const el = document.getElementById(`seat-${randomSeat.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      count++;
      if (count >= iterations) {
        clearInterval(timer);
        const luckySeat = available[Math.floor(Math.random() * available.length)];
        setSpinningSeatId(luckySeat.id);
        const finalEl = document.getElementById(`seat-${luckySeat.id}`);
        if (finalEl) finalEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          setSpinningSeatId(null);
          setMySelectedIds([luckySeat.id]);
          handleProceedToCheckout([luckySeat.id]);
        }, 1000);
      }
    }, intervalTime);
  };

  const removeSeatFromCheckout = (id: string) => {
    setMySelectedIds(prev => prev.filter(i => i !== id));
  };

  const handleNavigate = (newView: 'home' | 'hall' | 'admin' | 'cart') => {
    if (newView === 'admin' && !isAdmin) {
      setAuthOpen(true);
      return;
    }
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartTotalEstimation = useMemo(() => {
    return mySelectedSeats.reduce((acc, s) => acc + s.price, 0);
  }, [mySelectedSeats]);

  if (loading) return <div className="h-full w-full flex items-center justify-center bg-[#0d0101] text-[#d4af37] font-black text-xl md:text-2xl uppercase tracking-widest px-6 text-center"><RefreshCw className="animate-spin mr-4 shrink-0" /> Synchronizing Hall...</div>;

  return (
    <div className="h-full w-full flex flex-col font-sans cny-pattern no-swipe overflow-hidden">
      {showAnnouncement && <ImperialAnnouncement onEnter={() => setShowAnnouncement(false)} />}
      
      {!showAnnouncement && (
        <Navbar currentView={view} onNavigate={handleNavigate} isAdmin={isAdmin} />
      )}

      {showGachaModal && (
        <div 
          onClick={() => !isSpinning && setShowGachaModal(false)}
          className="fixed inset-0 z-[100000] flex items-start md:items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-3xl animate-fade-in overflow-y-auto cursor-pointer"
        >
           {showFireworks && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="firework-burst" style={{ '--fw-color': '#93c5fd', top: '20%', left: '50%' } as React.CSSProperties} />
                <div className="firework-burst scale-150" style={{ '--fw-color': '#fff', top: '50%', left: '30%' } as React.CSSProperties} />
                <div className="firework-burst scale-150" style={{ '--fw-color': '#fff', top: '50%', left: '70%' } as React.CSSProperties} />
              </div>
           )}
           {coinBurst && (
             <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="coin-particle" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }} />
                ))}
             </div>
           )}

           <div 
             onClick={(e) => e.stopPropagation()}
             className={`relative w-full max-w-md rounded-[48px] p-10 my-10 text-center transition-all duration-700 cursor-default ${isSpinning ? 'scale-105 border-yellow-400' : 'animate-parchment-reveal'} 
             ${auraResult ? AURA_CONFIG[auraResult].colorClass + ' ' + AURA_CONFIG[auraResult].glowClass : 'bg-[#fdf6e3] border-4 border-[#d4af37]'}`}
           >
              <button onClick={() => setShowGachaModal(false)} className="absolute top-8 right-8 p-2 rounded-full hover:bg-black/10 transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="mb-8">
                {isSpinning ? (
                   <div className="flex flex-col items-center">
                     <div className="text-[120px] animate-rapid-cycle drop-shadow-2xl">
                       {spinningAura === 'PLATINUM' ? '🐎' : spinningAura === 'GOLD' ? '🐲' : '🐅'}
                     </div>
                     <p className="mt-4 text-[10px] font-black text-stone-900 uppercase tracking-[0.6em] animate-pulse">Scanning Destiny...</p>
                   </div>
                ) : auraResult ? (
                   <div className="space-y-6">
                      <div className="text-[140px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-luck-shake inline-block">
                        {AURA_CONFIG[auraResult].icon}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black font-serif italic tracking-tight uppercase border-b-2 border-current pb-4 inline-block">
                        {AURA_CONFIG[auraResult].title}
                      </h2>
                      <p className="text-base font-bold leading-relaxed px-4 opacity-90 font-serif italic">
                        {AURA_CONFIG[auraResult].message}
                      </p>
                      <div className="bg-red-600/10 p-5 rounded-3xl border-2 border-dashed border-red-600/30 mt-8">
                        <p className="text-xs font-black text-red-700 uppercase tracking-widest leading-relaxed">
                          🧧 PREDICTION: You will receive A LOT of Ang Pao and Money after joining Thundering Hooves! 🧧
                        </p>
                      </div>
                   </div>
                ) : null}
              </div>
              {!isSpinning && (
                <button 
                  onClick={() => setShowGachaModal(false)}
                  className="w-full py-5 bg-black/10 hover:bg-black/20 rounded-3xl font-black uppercase text-xs tracking-[0.4em] transition-all"
                >
                  Dismiss Prosperity
                </button>
              )}
           </div>
        </div>
      )}

      {/* Main View Logic */}
      <main className="flex-1 w-full overflow-y-auto custom-scrollbar no-swipe relative z-10 pt-20 md:pt-24">
        {view === 'home' && (
          <Home onEnterHall={() => setView('hall')} />
        )}

        {view === 'hall' && (
          <div className="max-w-7xl mx-auto p-4 md:p-8 pb-[180px]">
             <div className="view-transition flex flex-col items-center">
              
              <Stage />

              {/* SECTION 1: VISUALLY LOOKS LIKE "GOLD" (Formerly Platinum) - 3 COLS */}
              <div className="w-full flex flex-col items-center">
                <SectionHeader tier={SeatTier.GOLD} label={`GOLD - RM ${config.tiers[SeatTier.GOLD].price.toFixed(2)}`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-14 w-full px-4">
                  {(Object.entries(seatsByTable) as [string, SeatData[]][]).filter(([id]) => parseInt(id) <= 6).map(([id, tableSeats]) => (
                    <RoundTable key={id} tableId={parseInt(id)} seats={tableSeats} tier={SeatTier.GOLD} config={config} mySelectedIds={mySelectedIds} onSeatClick={handleSeatClick} isAdmin={isAdmin} spinningSeatId={spinningSeatId} />
                  ))}
                </div>
              </div>

              {/* SECTION 2: THE REST OF THE GOLD TABLES - 4 COLS */}
              <div className="w-full flex flex-col items-center">
                <SectionHeader tier={SeatTier.GOLD} label={`GOLD - RM ${config.tiers[SeatTier.GOLD].price.toFixed(2)}`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-14 w-full px-4">
                  {(Object.entries(seatsByTable) as [string, SeatData[]][]).filter(([id]) => {
                    const tId = parseInt(id);
                    return tId > 6 && tId <= 10;
                  }).map(([id, tableSeats]) => (
                    <RoundTable key={id} tableId={parseInt(id)} seats={tableSeats} tier={SeatTier.GOLD} config={config} mySelectedIds={mySelectedIds} onSeatClick={handleSeatClick} isAdmin={isAdmin} spinningSeatId={spinningSeatId} />
                  ))}
                </div>
              </div>

              {/* SECTION 3: SILVER TABLES - 4 COLS */}
              <div className="w-full flex flex-col items-center">
                <SectionHeader tier={SeatTier.SILVER} label={`SILVER - RM ${config.tiers[SeatTier.SILVER].price.toFixed(2)}`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-14 w-full px-4">
                  {(Object.entries(seatsByTable) as [string, SeatData[]][]).filter(([id]) => {
                    const tId = parseInt(id);
                    return tId > 10;
                  }).map(([id, tableSeats]) => (
                    <RoundTable key={id} tableId={parseInt(id)} seats={tableSeats} tier={SeatTier.SILVER} config={config} mySelectedIds={mySelectedIds} onSeatClick={handleSeatClick} isAdmin={isAdmin} spinningSeatId={spinningSeatId} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'cart' && (
          <div className="view-transition max-w-2xl mx-auto p-4 md:p-8 pb-48">
            <button onClick={() => setView('hall')} className="mb-6 flex items-center gap-2 text-[#d4af37] font-black uppercase text-[10px] tracking-widest transition-transform hover:-translate-x-1"><ChevronLeft /> Back to Hall Map</button>
            <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl border-[6px] md:border-[12px] border-[#8b0000] overflow-hidden">
              <div className="bg-[#8b0000] p-6 md:p-10 text-[#fef9c3] flex justify-between items-center">
                  <h2 className="text-xl md:text-3xl font-serif font-black tracking-widest uppercase">Cart</h2>
                  <Ticket className="w-6 h-6 md:w-8 md:h-8 text-[#d4af37]" />
              </div>
              <div className="p-6 md:p-10 space-y-4 md:space-y-6">
                  {mySelectedSeats.length === 0 ? <p className="text-center py-20 text-stone-300 font-black italic">No seats selected</p> : mySelectedSeats.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 md:p-6 bg-stone-50 rounded-2xl md:rounded-3xl border border-stone-100">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-stone-900 text-white rounded-xl flex flex-col items-center justify-center font-black">
                          <span className="text-[6px] md:text-[7px] opacity-40 uppercase">
                            T-{s.tableId === 4 ? '3A' : s.tableId}
                          </span>
                          <span className="text-sm md:text-base">{s.seatNumber}</span>
                        </div>
                        <p className="font-black text-stone-800 uppercase text-sm md:text-lg">{config.tiers[s.tier].label}</p>
                        <p className="text-stone-400 font-bold ml-auto">RM{s.price.toFixed(2)}</p>
                      </div>
                      <button onClick={() => handleSeatClick(s.id)} className="text-red-500 hover:scale-110"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                  
                  {mySelectedSeats.length > 0 && (
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col gap-2">
                       <p className="text-right font-serif font-black text-xl text-stone-900">
                         Total: RM {cartTotalEstimation.toFixed(2)}
                       </p>
                    </div>
                  )}

                  <button onClick={() => handleProceedToCheckout()} disabled={mySelectedSeats.length === 0} className="w-full py-4 md:py-6 bg-[#d4af37] text-[#5c1a1a] rounded-[24px] md:rounded-3xl font-black text-lg md:text-xl uppercase shadow-xl hover:scale-[1.02] transition-all disabled:bg-stone-200">Checkout</button>
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && isAdmin && (
          <div className="max-w-7xl mx-auto p-4 md:p-8 pb-48">
            <AdminDashboard 
              seats={seats} 
              onSelectSeat={setSelectedAdminSeat} 
              onReset={async (id) => { await deleteBooking(id); }}
              onApprove={async (seat) => { 
                await submitBookingRequest(seat.id, { 
                  status: SeatStatus.SOLD, 
                  paymentInfo: seat.paymentInfo 
                }); 
              }}
              onLogout={() => { setIsAdmin(false); setView('home'); }}
              onPreviewAura={(tier) => triggerAuraResult(tier)}
              currentPrices={tierPrices}
              onUpdatePrices={handleUpdatePrices}
            />
          </div>
        )}
      </main>

      {/* Hall Action Dock (Outside of main scrollable area) */}
      {view === 'hall' && !showAnnouncement && (
        <>
          <div 
            className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 pointer-events-auto"
          >
            <button 
              onClick={handleRandomPick}
              className="group whitespace-nowrap px-4 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-stone-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.1em] shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-2 border-white/30 backdrop-blur-[10px]"
              style={{ background: 'rgba(251,191,36,0.9)' }}
            >
              <Zap className="w-4 h-4 fill-current animate-pulse" />
              <span>Destiny Pick</span>
            </button>

            <button 
              onClick={handleTestLuck}
              className="group whitespace-nowrap px-4 py-3 bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.1em] shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-2 border-white/10 backdrop-blur-[10px]"
              style={{ background: 'rgba(147,51,234,0.8)' }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Reveal Aura</span>
            </button>
          </div>

          {mySelectedSeats.length > 0 && (
            <div className="fixed bottom-6 right-6 z-[9999] pointer-events-auto">
              <button 
                onClick={() => setView('cart')}
                className="whitespace-nowrap px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-110 active:scale-95 transition-all flex items-center gap-3 border-2 border-white/20 backdrop-blur-[12px]"
                style={{ background: 'rgba(185,28,28,0.95)', backdropFilter: 'blur(12px)' }}
              >
                <ShoppingBag className="w-5 h-5" /> 
                <span>Review & Book ({mySelectedIds.length})</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Shared Modals */}
      <ConfirmationModal 
        isOpen={isConfirmOpen} timeLeft={timeLeft} onClose={handleCheckoutCleanup} 
        seats={mySelectedSeats}
        onRemoveSeat={removeSeatFromCheckout}
        onConfirm={(d: Record<string, SeatDetail>) => { 
          setPendingDetails(d); 
          const calcTotal = Object.entries(d).reduce((sum, [id, det]) => {
            const seat = seats.find(st => st.id === id);
            return sum + (det.isMember ? (seat?.price || 0) - MEMBER_DISCOUNT_AMOUNT : (seat?.price || 0));
          }, 0);
          setTotalPrice(calcTotal); 
          setConfirmOpen(false); 
          setPaymentOpen(true); 
        }} 
      />
      
      <PaymentModal 
        isOpen={isPaymentOpen} timeLeft={timeLeft} onClose={handleCheckoutCleanup} 
        amount={totalPrice} count={mySelectedSeats.length} paymentConfig={config.payment} 
        seats={seats} pendingDetails={pendingDetails}
        onConfirm={() => { 
            setIsTimerActive(false);
            setBookedSeats(mySelectedSeats);
            setMySelectedIds([]);
            setPaymentOpen(false); 
            setAngpaoOpen(true);
            setView('hall'); 
        }} 
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setAuthOpen(false)} onLogin={() => { setIsAdmin(true); setAuthOpen(false); setView('admin'); }} />
      <DigitalAngpaoModal isOpen={isAngpaoOpen} onClose={() => setAngpaoOpen(false)} seats={bookedSeats} />
      
      <AdminSeatDetailsModal 
        isOpen={!!selectedAdminSeat} onClose={() => setSelectedAdminSeat(null)} seat={selectedAdminSeat} 
        onSync={async () => {}}
        onReset={async (id) => { await deleteBooking(id); }}
        onUpdateStatus={async (id, status, details) => { await submitBookingRequest(id, { status, paymentInfo: details }); }}
      />
    </div>
  );
};

export default App;
