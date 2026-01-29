import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { SeatData, SeatStatus, SeatTier, ConcertConfig, SeatDetail } from './types';
import { Seat } from './components/Seat';
import { PaymentModal } from './components/PaymentModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { submitBookingRequest, subscribeToSeats, submitBatchBookingRequest, deleteBooking, db } from './services/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
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
  LogOut, Ticket, X, Zap, Trophy, Gift, Gamepad2, Loader2
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
  PLATINUM: { type: 'PLATINUM', title: '🔥 CELESTIAL FIRE HORSE 🔥', icon: '🐎', message: 'Such wonderful luck! You possess a fortune so rare, you must bring this energy to our next event to bless us all!', colorClass: 'holographic-bg text-blue-900', glowClass: 'shadow-[0_0_80px_rgba(147,197,253,1)]' },
  GOLD: { type: 'GOLD', title: '🐉 MYSTIC GOLD DRAGON 🐉', icon: '🐲', message: 'Your fortune is accumulating! By attending tonight, you will gain even MORE luck and prosperity after this event.', colorClass: 'bg-gradient-to-br from-amber-400 via-yellow-200 to-amber-600 text-amber-950', glowClass: 'shadow-[0_0_60px_rgba(251,191,36,0.9)]' },
  SILVER: { type: 'SILVER', title: '⚡ SWIFT SILVER TIGER ⚡', icon: '🐅', message: 'Your destiny is changing! Simply by joining this event, your luck is about to SKYROCKET to the moon!', colorClass: 'bg-gradient-to-br from-stone-400 via-stone-100 to-stone-500 text-stone-900', glowClass: 'shadow-[0_0_50px_rgba(214,211,209,0.8)]' }
};

const DEFAULT_PRICES = { [SeatTier.PLATINUM]: 0, [SeatTier.GOLD]: 10.88, [SeatTier.SILVER]: 8.88 };

const BASE_CONFIG: ConcertConfig = {
  totalTables: 14,
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

// --- MINIGAME COMPONENTS ---
const AngpaoRainGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [angpaos, setAngpaos] = useState<{id: number, left: number, speed: number}[]>([]);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'LEADERBOARD'>('START');
  const [leaderboard, setLeaderboard] = useState<{name: string, score: number}[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const spawnInterval = setInterval(() => {
      setAngpaos(prev => [...prev, { id: Date.now(), left: Math.random() * 85, speed: 1.5 + Math.random() * 2 }]);
    }, 450);
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setGameState('GAMEOVER'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { clearInterval(spawnInterval); clearInterval(timerInterval); };
  }, [gameState]);

  const fetchScores = async () => {
    try {
      const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(5));
      const querySnapshot = await getDocs(q);
      const scores = querySnapshot.docs.map(doc => doc.data() as {name: string, score: number});
      setLeaderboard(scores);
    } catch (e) { console.error("Error fetching leaderboard: ", e); }
  };

  const handleSaveScore = async () => {
    if (!playerName.trim()) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "leaderboard"), {
        name: playerName,
        score: score,
        createdAt: serverTimestamp()
      });
      await fetchScores();
      setGameState('LEADERBOARD');
    } catch (e) { alert("Failed to save score."); }
    setIsSaving(false);
  };

  const catchAngpao = (id: number) => {
    setAngpaos(prev => prev.filter(a => a.id !== id));
    setScore(s => s + 10);
  };

  return (
    <div className="fixed inset-0 z-[100001] bg-black/90 flex flex-col items-center justify-center overflow-hidden cny-pattern backdrop-blur-md">
      <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 z-20 text-white">
        <X className="w-8 h-8" />
      </button>

      {gameState === 'START' && (
        <div className="text-center animate-fade-in space-y-6">
          <div className="text-8xl mb-4 animate-bounce">🧧</div>
          <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">Angpao Rain</h2>
          <button onClick={() => { setGameState('PLAYING'); setScore(0); setTimeLeft(15); }} className="px-12 py-5 bg-[#d4af37] text-stone-900 rounded-full font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-110 transition-transform">Start Game</button>
          <button onClick={() => { fetchScores(); setGameState('LEADERBOARD'); }} className="block mx-auto text-white/40 text-xs font-black uppercase hover:text-[#d4af37]">Leaderboard</button>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <>
          <div className="absolute top-10 flex gap-8 text-white font-black text-2xl z-10 bg-red-600/20 px-6 py-3 rounded-full border border-red-500/50 backdrop-blur-xl">
            <div className="text-yellow-400">💰 {score}</div>
            <div className={timeLeft < 5 ? "text-red-500 animate-pulse" : "text-white"}>⏱️ {timeLeft}s</div>
          </div>
          {angpaos.map(angpao => (
            <div key={angpao.id} onClick={() => catchAngpao(angpao.id)} className="absolute cursor-pointer animate-fall"
              style={{ left: `${angpao.left}%`, animationDuration: `${angpao.speed}s`, top: '-100px' }}>
              <div className="w-16 h-20 bg-red-600 rounded-lg border-2 border-yellow-400 flex items-center justify-center shadow-2xl text-3xl">🧧</div>
            </div>
          ))}
        </>
      )}

      {gameState === 'GAMEOVER' && (
        <div className="z-20 bg-[#fff7ed] p-10 rounded-[40px] text-center border-4 border-[#d4af37] animate-bounce-in shadow-2xl max-w-sm mx-4">
           <h2 className="text-3xl font-black text-[#8b0000] mb-2 uppercase font-serif">Time's Up!</h2>
           <div className="text-6xl font-black text-[#d4af37] mb-8">{score}</div>
           <input type="text" placeholder="YOUR NAME" maxLength={10} value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full p-4 bg-stone-100 border-2 rounded-2xl text-center font-black uppercase mb-4 focus:border-[#d4af37] outline-none" />
           <button onClick={handleSaveScore} disabled={isSaving || !playerName.trim()} className="w-full py-4 bg-[#8b0000] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2">
             {isSaving ? <Loader2 className="animate-spin" /> : 'Submit Score'}
           </button>
        </div>
      )}

      {gameState === 'LEADERBOARD' && (
        <div className="z-20 bg-stone-900 border-2 border-[#d4af37] p-8 rounded-[40px] w-full max-w-xs animate-fade-in shadow-2xl text-center">
          <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest flex items-center justify-center gap-3"><Trophy className="w-6 h-6 text-yellow-500" /> Top Scores</h2>
          <div className="space-y-3 mb-8">
            {leaderboard.map((e, i) => (
              <div key={i} className={`flex justify-between items-center p-3 rounded-xl ${i === 0 ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-white/5'}`}>
                <span className="text-white font-bold uppercase text-sm">#{i+1} {e.name}</span>
                <span className="text-yellow-500 font-mono font-black">{e.score}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setGameState('START')} className="w-full py-3 bg-white/10 text-white rounded-xl font-black text-[10px] uppercase">Back</button>
        </div>
      )}
      <style>{`@keyframes fall { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(110vh) rotate(360deg); } } .animate-fall { animation: fall linear forwards; }`}</style>
    </div>
  );
};

const Stage = () => (
  <div className="w-full max-w-4xl mx-auto mb-20 relative px-4 mt-8">
    <div className="h-28 md:h-40 bg-gradient-to-b from-stone-900 to-stone-950 rounded-t-[100px] border-x-[15px] md:border-x-[40px] border-stone-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden relative group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.2)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-[#d4af37]/40 shadow-[0_0_15px_#d4af37]" />
      <div className="flex flex-col items-center gap-2 relative z-10">
        <div className="flex items-center gap-4 text-[#d4af37]">
          <Trophy className="w-5 h-5 md:w-7 md:h-7 animate-pulse" />
          <h3 className="font-serif font-black text-xl md:text-5xl tracking-[0.4em] uppercase text-gold-glow">MAIN STAGE</h3>
          <Trophy className="w-5 h-5 md:w-7 md:h-7 animate-pulse" />
        </div>
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
      </div>
    </div>
    <div className="absolute -bottom-10 left-0 right-0 h-56 bg-[radial-gradient(50%_40%_at_50%_0%,rgba(212,175,55,0.18)_0%,transparent_100%)] pointer-events-none" />
  </div>
);

const SectionHeader: React.FC<{ tier: SeatTier, label: string }> = ({ tier, label }) => {
  const visualTier = label.includes("GOLD") ? SeatTier.GOLD : tier;
  const icon = visualTier === SeatTier.GOLD ? <Star className="w-5 h-5 md:w-8 md:h-8 fill-current" /> : <Sparkles className="w-5 h-5 md:w-8 md:h-8" />;
  const gradient = visualTier === SeatTier.GOLD ? "from-[#d4af37] via-[#fef9c3] to-[#d4af37] text-[#5c1a1a]" : "from-[#57534e] via-stone-300 to-[#57534e] text-white";
  return (
    <div className="flex flex-col items-center w-full relative z-[5] gap-4 mt-12 mb-6 pointer-events-none px-4 text-center">
      <div className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 border-white/20 bg-gradient-to-r ${gradient} transform scale-90 md:scale-100 shadow-xl backdrop-blur-sm`}>
         <div className="animate-pulse shrink-0">{icon}</div>
         <span className="text-xs md:text-xl font-black uppercase tracking-[0.15em] font-serif whitespace-nowrap drop-shadow-md">{label}</span>
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
  const tierColor = (tier === SeatTier.PLATINUM || tier === SeatTier.GOLD) ? config.tiers[SeatTier.GOLD].color : config.tiers[SeatTier.SILVER].color;
  const isSoldOut = seats.length > 0 && seats.every(s => s.status === SeatStatus.SOLD);

  return (
    <div className="relative select-none transition-transform hover:scale-105 duration-500 shrink-0 z-10 mx-auto" style={{ width: containerSize, height: containerSize }}>
       {isSoldOut && <div className="absolute inset-0 m-auto w-32 h-32 md:w-44 md:h-44 bg-amber-400/20 blur-[40px] md:blur-[60px] animate-pulse rounded-full z-0 opacity-80" />}
       <div className={`absolute inset-0 m-auto w-20 h-20 md:w-28 md:h-28 rounded-full border-[4px] md:border-[6px] flex flex-col items-center justify-center shadow-2xl z-10 bg-white transition-all ${isSoldOut ? 'shadow-[0_0_40px_rgba(212,175,55,0.7)]' : ''}`} style={{ borderColor: isSoldOut ? '#d4af37' : tierColor }}>
          <span className="text-[6px] md:text-[7px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#d4af37]">{isSoldOut ? 'SOLD OUT' : 'TABLE'}</span>
          {/* MAPPING: Table 4 -> 3A, Table 14 -> 13A */}
          <span className={`text-xl md:text-4xl font-serif font-black ${isSoldOut ? 'text-[#d4af37]' : 'text-stone-900'}`}>
            {tableId === 4 ? '3A' : tableId === 14 ? '13A' : tableId}
          </span>
       </div>
       {seats.map((seat) => {
         const angle = ((seat.seatNumber - 1) / config.seatsPerTable) * 2 * Math.PI - (Math.PI / 2);
         const isSpinningHighlight = spinningSeatId === seat.id;
         return (
           <div key={seat.id} className="absolute z-20" style={{ left: center + baseRadius * Math.cos(angle), top: center + baseRadius * Math.sin(angle), transform: 'translate(-50%, -50%)' }}>
             <Seat 
               data={{...seat, tableId: (seat.tableId === 4 ? '3A' : seat.tableId === 14 ? '13A' : seat.tableId)} as any} 
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
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('thundering_prices') : null;
    return saved ? JSON.parse(saved) : DEFAULT_PRICES;
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
    if (typeof localStorage !== 'undefined') localStorage.setItem('thundering_prices', JSON.stringify(newPrices));
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
  const [showGameModal, setShowGameModal] = useState(false);
  const [pendingDetails, setPendingDetails] = useState<Record<string, SeatDetail>>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedAdminSeat, setSelectedAdminSeat] = useState<SeatData | null>(null);
  const [timeLeft, setTimeLeft] = useState(LOCK_DURATION_SECONDS); 
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [spinningSeatId, setSpinningSeatId] = useState<string | null>(null);

  // Aura State
  const [showGachaModal, setShowGachaModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningAura, setSpinningAura] = useState<AuraType>('SILVER');
  const [auraResult, setAuraResult] = useState<AuraType | null>(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [coinBurst, setCoinBurst] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('thundering_hooves_aura') as AuraType | null;
    if (saved && AURA_CONFIG[saved]) setAuraResult(saved);
  }, []);

  const triggerAuraResult = (res: AuraType) => {
    setAuraResult(res);
    setShowGachaModal(true);
    setIsSpinning(false);
    if (res === 'PLATINUM') {
      setShowFireworks(true);
      document.body.classList.add('thundering-rumble');
      setTimeout(() => { setShowFireworks(false); document.body.classList.remove('thundering-rumble'); }, 3000);
    } else if (res === 'GOLD') {
      setCoinBurst(true);
      setTimeout(() => setCoinBurst(false), 3000);
    }
  };

  const handleTestLuck = () => {
    if (auraResult) { setShowGachaModal(true); return; }
    setShowGachaModal(true);
    setIsSpinning(true);
    const types: AuraType[] = ['SILVER', 'GOLD', 'PLATINUM'];
    let cycleCount = 0;
    const interval = setInterval(() => { setSpinningAura(types[cycleCount % 3]); cycleCount++; }, 100);
    setTimeout(() => {
      clearInterval(interval);
      const rand = Math.random();
      let res: AuraType = rand < 0.05 ? 'PLATINUM' : rand < 0.40 ? 'GOLD' : 'SILVER';
      triggerAuraResult(res);
      localStorage.setItem('thundering_hooves_aura', res);
    }, 3000);
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToSeats((cloudSeats) => {
      setSeats(prevSeats => {
        let baseSeats: SeatData[] = prevSeats.length > 0 ? [...prevSeats] : [];
        if (baseSeats.length === 0) {
           for (let t = 1; t <= 14; t++) {
             let tier = t <= 10 ? SeatTier.GOLD : SeatTier.SILVER;
             for (let s = 1; s <= 6; s++) {
               baseSeats.push({ id: `t${t}-s${s}`, tableId: t, seatNumber: s, status: SeatStatus.AVAILABLE, tier, price: config.tiers[tier].price });
             }
           }
        }
        return baseSeats.map(localSeat => {
          const cloudData = cloudSeats[localSeat.id];
          const currPrice = config.tiers[localSeat.tier].price;
          if (cloudData) {
            return { ...localSeat, price: currPrice, status: cloudData.status, paymentInfo: cloudData.paymentInfo, lockedBy: cloudData.lockedBy, lockedAt: cloudData.lockedAt };
          }
          return { ...localSeat, price: currPrice };
        });
      });
      setLoading(false);
    });
    return () => unsubscribe(); 
  }, [config]);

  const handleSeatClick = useCallback((id: string) => {
    const target = seatsRef.current.find(s => s.id === id);
    if (!target) return;
    if (isAdmin) { setSelectedAdminSeat(target); return; }
    if (target.status === SeatStatus.AVAILABLE) setMySelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, [isAdmin]);

  useEffect(() => { seatsRef.current = seats; }, [seats]);

  const handleProceedToCheckout = async (targetIds?: string[]) => {
    const ids = targetIds || mySelectedIds;
    if (ids.length === 0) return;
    setLoading(true);
    try {
      const now = Date.now();
      const bookings = ids.map(id => ({ seatId: id, data: { status: SeatStatus.CHECKOUT, lockedAt: now, lockedBy: currentUserId } }));
      await submitBatchBookingRequest(bookings);
      setTimeLeft(LOCK_DURATION_SECONDS); setIsTimerActive(true); setConfirmOpen(true);
    } catch (e) { alert("Error securing seats."); }
    setLoading(false);
  };

  const handleRandomPick = () => {
    const available = seats.filter(s => s.status === SeatStatus.AVAILABLE);
    if (available.length === 0) return;
    const duration = 6000; const intervalTime = 500;
    let count = 0;
    const timer = setInterval(() => {
      const randomSeat = available[Math.floor(Math.random() * available.length)];
      setSpinningSeatId(randomSeat.id);
      const el = document.getElementById(`seat-${randomSeat.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      count++;
      if (count >= duration/intervalTime) {
        clearInterval(timer);
        const luckySeat = available[Math.floor(Math.random() * available.length)];
        setSpinningSeatId(null);
        setMySelectedIds([luckySeat.id]);
        handleProceedToCheckout([luckySeat.id]);
      }
    }, intervalTime);
  };

  const handleCheckoutCleanup = useCallback(async () => {
    setIsTimerActive(false);
    const bookings = mySelectedIds.map(id => ({ seatId: id, data: { status: SeatStatus.AVAILABLE, lockedAt: null, lockedBy: null, paymentInfo: null } }));
    await submitBatchBookingRequest(bookings);
    setMySelectedIds([]); setConfirmOpen(false); setPaymentOpen(false);
  }, [mySelectedIds]);

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft(prev => prev <= 1 ? (handleCheckoutCleanup(), 0) : prev - 1), 1000);
      return () => clearInterval(timerId);
    }
  }, [isTimerActive, timeLeft, handleCheckoutCleanup]);

  const mySelectedSeats = useMemo(() => seats.filter(s => mySelectedIds.includes(s.id)), [seats, mySelectedIds]);
  const cartTotalEstimation = useMemo(() => mySelectedSeats.reduce((acc, s) => acc + s.price, 0), [mySelectedSeats]);

  if (loading) return <div className="h-full w-full flex items-center justify-center bg-[#0d0101] text-[#d4af37] font-black uppercase tracking-widest px-6 text-center"><RefreshCw className="animate-spin mr-4 shrink-0" /> Synchronizing Hall...</div>;

  return (
    <div className="h-full w-full flex flex-col font-sans cny-pattern no-swipe overflow-hidden bg-[#0d0101]">
      <Navbar currentView={view} onNavigate={(v) => { if(v==='admin' && !isAdmin) setAuthOpen(true); else setView(v); }} isAdmin={isAdmin} />
      {showGameModal && <AngpaoRainGame onClose={() => setShowGameModal(false)} />}
      
      {showGachaModal && (
        <div onClick={() => !isSpinning && setShowGachaModal(false)} className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-3xl animate-fade-in overflow-y-auto cursor-pointer">
           {showFireworks && <div className="absolute inset-0 pointer-events-none"><div className="firework-burst" style={{ '--fw-color': '#93c5fd', top: '20%', left: '50%' } as React.CSSProperties} /><div className="firework-burst scale-150" style={{ '--fw-color': '#fff', top: '50%', left: '30%' } as React.CSSProperties} /></div>}
           <div onClick={(e) => e.stopPropagation()} className={`relative w-full max-w-md rounded-[48px] p-10 text-center transition-all duration-700 ${isSpinning ? 'scale-105 border-yellow-400' : 'animate-parchment-reveal'} ${auraResult ? AURA_CONFIG[auraResult].colorClass + ' ' + AURA_CONFIG[auraResult].glowClass : 'bg-[#fdf6e3] border-4 border-[#d4af37]'}`}>
              <button onClick={() => setShowGachaModal(false)} className="absolute top-8 right-8 p-2 rounded-full hover:bg-black/10"><X className="w-6 h-6" /></button>
              <div className="mb-8">{isSpinning ? <div className="flex flex-col items-center"><div className="text-[120px] animate-rapid-cycle drop-shadow-2xl">{spinningAura === 'PLATINUM' ? '🐎' : spinningAura === 'GOLD' ? '🐲' : '🐅'}</div><p className="mt-4 text-[10px] font-black uppercase tracking-[0.6em] animate-pulse text-black">Scanning Destiny...</p></div> : auraResult ? <div className="space-y-6"><div className="text-[140px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-luck-shake inline-block">{AURA_CONFIG[auraResult].icon}</div><h2 className="text-2xl font-black italic uppercase border-b-2 border-current pb-4 inline-block">{AURA_CONFIG[auraResult].title}</h2><p className="text-base font-bold italic">{AURA_CONFIG[auraResult].message}</p></div> : null}</div>
              {!isSpinning && <button onClick={() => setShowGachaModal(false)} className="w-full py-5 bg-black/10 hover:bg-black/20 rounded-3xl font-black uppercase text-xs tracking-[0.4em]">Dismiss Prosperity</button>}
           </div>
        </div>
      )}

      <main className="flex-1 w-full overflow-y-auto custom-scrollbar no-swipe pt-20 md:pt-24 relative z-10">
        {view === 'home' && <Home onEnterHall={() => setView('hall')} />}
        {view === 'hall' && (
          <div className="max-w-7xl mx-auto p-4 md:p-8 pb-[180px]">
             <div className="flex flex-col items-center">
              <Stage />
              <SectionHeader tier={SeatTier.GOLD} label={`GOLD - RM ${config.tiers[SeatTier.GOLD].price.toFixed(2)}`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-4">
                {Array.from({ length: 6 }).map((_, i) => (<RoundTable key={i+1} tableId={i+1} seats={seats.filter(s => s.tableId === i+1)} tier={SeatTier.GOLD} config={config} mySelectedIds={mySelectedIds} onSeatClick={handleSeatClick} spinningSeatId={spinningSeatId} />))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-4 mt-12">
                {Array.from({ length: 4 }).map((_, i) => (<RoundTable key={i+7} tableId={i+7} seats={seats.filter(s => s.tableId === i+7)} tier={SeatTier.GOLD} config={config} mySelectedIds={mySelectedIds} onSeatClick={handleSeatClick} spinningSeatId={spinningSeatId} />))}
              </div>
              <SectionHeader tier={SeatTier.SILVER} label={`SILVER - RM ${config.tiers[SeatTier.SILVER].price.toFixed(2)}`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-4 mt-12">
                {Array.from({ length: 4 }).map((_, i) => (<RoundTable key={i+11} tableId={i+11} seats={seats.filter(s => s.tableId === i+11)} tier={SeatTier.SILVER} config={config} mySelectedIds={mySelectedIds} onSeatClick={handleSeatClick} spinningSeatId={spinningSeatId} />))}
              </div>
            </div>
          </div>
        )}
        {view === 'cart' && (
          <div className="view-transition max-w-2xl mx-auto p-4 md:p-8 pb-48">
            <button onClick={() => setView('hall')} className="mb-6 flex items-center gap-2 text-[#d4af37] font-black uppercase text-[10px]"><ChevronLeft /> Back to Hall Map</button>
            <div className="bg-white rounded-[32px] shadow-2xl border-[6px] border-[#8b0000] overflow-hidden">
              <div className="bg-[#8b0000] p-6 text-[#fef9c3] flex justify-between items-center"><h2 className="text-xl font-serif font-black uppercase">Cart</h2><Ticket className="w-6 h-6 text-[#d4af37]" /></div>
              <div className="p-6 space-y-4">
                  {mySelectedSeats.length === 0 ? <p className="text-center py-20 text-stone-300 italic">No seats selected</p> : mySelectedSeats.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-stone-900 text-white rounded-xl flex flex-col items-center justify-center font-black uppercase text-[8px]">
                          <span>T-{s.tableId === 4 ? '3A' : s.tableId === 14 ? '13A' : s.tableId}</span>
                          <span className="text-sm font-black">{s.seatNumber}</span>
                        </div>
                        <p className="font-black text-stone-800 uppercase text-[10px]">{config.tiers[s.tier].label}</p>
                        <p className="text-stone-400 font-bold ml-auto text-xs">RM{s.price.toFixed(2)}</p>
                      </div>
                      <button onClick={() => handleSeatClick(s.id)} className="text-red-500"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                  <div className="p-4 bg-stone-50 rounded-xl flex justify-end font-serif font-black text-xl text-stone-900">Total: RM {cartTotalEstimation.toFixed(2)}</div>
                  <button onClick={() => setConfirmOpen(true)} disabled={mySelectedSeats.length === 0} className="w-full py-6 bg-[#d4af37] text-[#5c1a1a] rounded-3xl font-black text-xl uppercase shadow-xl hover:scale-[1.02] disabled:bg-stone-200 transition-all">Checkout</button>
              </div>
            </div>
          </div>
        )}
        {view === 'admin' && isAdmin && (
          <div className="max-w-7xl mx-auto p-4 md:p-8 pb-48">
            <AdminDashboard seats={seats} onSelectSeat={setSelectedAdminSeat} onReset={async (id) => { await deleteBooking(id); }} onApprove={async (seat) => { await submitBookingRequest(seat.id, { status: SeatStatus.SOLD, paymentInfo: seat.paymentInfo }); }} onLogout={() => { setIsAdmin(false); setView('home'); }} currentPrices={tierPrices} onUpdatePrices={handleUpdatePrices} />
          </div>
        )}
      </main>

      {view === 'hall' && (
        <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3">
          <button onClick={handleRandomPick} className="whitespace-nowrap px-4 py-3 bg-[#d4af37] text-stone-900 rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 border-2 border-white/30 backdrop-blur-[10px] hover:scale-105 transition-all"><Zap className="w-4 h-4 fill-current animate-pulse" /> Destiny Pick</button>
          <button onClick={() => setShowGameModal(true)} className="whitespace-nowrap px-4 py-3 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 border-2 border-white/20 hover:scale-105 transition-all"><Gamepad2 className="w-4 h-4" /> Catch Angpao</button>
          <button onClick={handleTestLuck} className="whitespace-nowrap px-4 py-3 bg-purple-600 text-white rounded-2xl font-black uppercase text-[10px] flex items-center gap-3 border-2 border-white/10 backdrop-blur-[10px] hover:scale-105 transition-all"><Sparkles className="w-4 h-4" /> Reveal Aura</button>
        </div>
      )}
      
      {mySelectedSeats.length > 0 && view === 'hall' && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <button onClick={() => setView('cart')} className="px-8 py-4 bg-red-700 text-white rounded-3xl font-black uppercase text-xs flex items-center gap-3 shadow-2xl border-2 border-white/20 hover:scale-110 transition-all"><ShoppingBag className="w-5 h-5" /> Book ({mySelectedIds.length})</button>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setAuthOpen(false)} onLogin={() => { setIsAdmin(true); setAuthOpen(false); setView('admin'); }} />
      <ConfirmationModal isOpen={isConfirmOpen} timeLeft={timeLeft} onClose={handleCheckoutCleanup} onConfirm={(d) => { setPendingDetails(d); setConfirmOpen(false); setPaymentOpen(true); }} seats={mySelectedSeats} onRemoveSeat={id => setMySelectedIds(p => p.filter(x => x !== id))} />
      <PaymentModal isOpen={isPaymentOpen} timeLeft={timeLeft} onClose={handleCheckoutCleanup} amount={mySelectedSeats.reduce((acc, s) => acc + (pendingDetails[s.id]?.isMember ? s.price - 1 : s.price), 0)} count={mySelectedSeats.length} paymentConfig={config.payment} seats={seats} pendingDetails={pendingDetails} onConfirm={() => { setIsTimerActive(false); setBookedSeats(mySelectedSeats); setMySelectedIds([]); setPaymentOpen(false); setAngpaoOpen(true); setView('hall'); }} />
      <DigitalAngpaoModal isOpen={isAngpaoOpen} onClose={() => setAngpaoOpen(false)} seats={bookedSeats} />
      <AdminSeatDetailsModal isOpen={!!selectedAdminSeat} onClose={() => setSelectedAdminSeat(null)} seat={selectedAdminSeat} onReset={async (id) => { await deleteBooking(id); }} onUpdateStatus={async (id, status, details) => { await submitBookingRequest(id, { status, paymentInfo: details }); }} />
    </div>
  );
};

export default App;
