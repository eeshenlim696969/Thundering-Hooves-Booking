
import React, { useState, useMemo } from 'react';
import { SeatData, SeatStatus, SeatTier } from '../types';
import { Seat } from './Seat';
import { 
  Search, Utensils, Map as MapIcon, List, Flame, Star, Sparkles, 
  TrendingUp, UserCheck, PieChart, Eye, Trash2, 
  FileSpreadsheet, Loader2, LogOut, MinusCircle, Wand2,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  seats: SeatData[];
  onSelectSeat: (seat: SeatData) => void;
  onReset: (seatId: string) => Promise<void>;
  onApprove?: (seat: SeatData) => Promise<void>;
  onLogout: () => void;
  onPreviewAura?: (tier: 'PLATINUM' | 'GOLD' | 'SILVER') => void;
}

const SectionHeader: React.FC<{ tier: SeatTier, label: string }> = ({ tier, label }) => {
  const icon = tier === SeatTier.PLATINUM ? <Flame className="w-5 h-5" /> : 
               tier === SeatTier.GOLD ? <Star className="w-5 h-5" /> : 
               <Sparkles className="w-5 h-5" />;
               
  const gradient = tier === SeatTier.PLATINUM ? "bg-red-950/80 text-red-200 border-red-500/40" :
                   tier === SeatTier.GOLD ? "bg-amber-950/80 text-amber-200 border-amber-500/40" :
                   "bg-stone-900/80 text-stone-200 border-stone-500/40";

  return (
    <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border backdrop-blur-xl mb-6 shadow-xl ${gradient}`}>
       {icon}
       <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] font-serif">{label}</span>
       {icon}
    </div>
  );
};

const RoundTable: React.FC<{
  tableId: number;
  seats: SeatData[];
  tier: SeatTier;
  onSeatClick: (id: string) => void;
}> = ({ tableId, seats, tier, onSeatClick }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const containerSize = isMobile ? 180 : 240; 
  const center = containerSize / 2;
  const baseRadius = isMobile ? 60 : 80; 
  const tierColor = tier === SeatTier.PLATINUM ? '#b91c1c' : tier === SeatTier.GOLD ? '#d4af37' : '#57534e';

  return (
    <div className="relative select-none shrink-0 mx-auto transition-transform hover:scale-105 duration-500" style={{ width: containerSize, height: containerSize }}>
       <div className="absolute inset-0 m-auto w-20 h-20 md:w-28 md:h-28 rounded-full border-4 flex flex-col items-center justify-center bg-white shadow-2xl border-stone-100 z-10">
          <span className="text-[6px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">TABLE</span>
          <span className="text-xl md:text-3xl font-serif font-black text-stone-900 leading-none">{tableId}</span>
       </div>
       {seats.map((seat) => {
         const angle = ((seat.seatNumber - 1) / seats.length) * 2 * Math.PI - (Math.PI / 2);
         return (
           <div key={seat.id} className="absolute z-20" style={{ left: center + baseRadius * Math.cos(angle), top: center + baseRadius * Math.sin(angle), transform: 'translate(-50%, -50%)' }}>
             <Seat 
                data={seat} 
                color={tierColor} 
                isSelected={false} 
                isLockedByOther={false} 
                onClick={onSeatClick} 
                isAdmin={true} 
                className="w-10 h-10 md:w-12 md:h-12"
             />
           </div>
         );
       })}
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ seats, onSelectSeat, onReset, onApprove, onLogout, onPreviewAura }) => {
  const [activeView, setActiveView] = useState<'financials' | 'map' | 'manifest'>('financials');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deduction, setDeduction] = useState<string>('0');
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const stats = useMemo(() => {
    const occupiedSeats = seats.filter(s => s.status !== SeatStatus.AVAILABLE);
    const soldSeats = seats.filter(s => s.status === SeatStatus.SOLD);
    const revenue = soldSeats.reduce((acc, s) => {
      const final = s.paymentInfo?.isMember ? s.price - 1.0 : s.price;
      return acc + final;
    }, 0);
    const expenseNum = parseFloat(deduction) || 0;
    return {
      totalRevenue: revenue,
      netProfit: revenue - expenseNum,
      soldCount: soldSeats.length,
      totalCapacity: seats.length,
      vegan: occupiedSeats.filter(s => s.paymentInfo?.isVegan).length,
      standard: occupiedSeats.length - occupiedSeats.filter(s => s.paymentInfo?.isVegan).length,
      occupiedCount: occupiedSeats.length,
    };
  }, [seats, deduction]);

  const parseId = (id: string) => {
    const match = id.match(/t(\d+)-s(\d+)/);
    return {
      table: match ? match[1] : '-',
      seat: match ? match[2] : '-'
    };
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return { date: '-', time: '-' };
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { date: '-', time: '-' };
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return {
      date: `${day}/${month}/${year}`,
      time: `${hours}:${minutes}`
    };
  };

  const filteredSeats = useMemo(() => {
    return seats.filter(s => {
      if (s.status === SeatStatus.AVAILABLE || removedIds.has(s.id)) return false;
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      const name = s.paymentInfo?.studentName?.toLowerCase() || '';
      const sid = s.paymentInfo?.studentId?.toLowerCase() || '';
      return name.includes(term) || sid.includes(term);
    }).sort((a, b) => {
      const aInfo = parseId(a.id);
      const bInfo = parseId(b.id);
      if (parseInt(aInfo.table) !== parseInt(bInfo.table)) return parseInt(aInfo.table) - parseInt(bInfo.table);
      return parseInt(aInfo.seat) - parseInt(bInfo.seat);
    });
  }, [seats, searchTerm, removedIds]);

  const seatsByTable = useMemo<Record<number, SeatData[]>>(() => {
    const map: Record<number, SeatData[]> = {};
    seats.forEach(s => {
      if (!map[s.tableId]) map[s.tableId] = [];
      map[s.tableId].push(s);
    });
    return map;
  }, [seats]);

  const handleExportCSV = () => {
    const headers = [
      "Table", "Seat", "ID", "Name", "Student ID", "Member", "Vegan", "Status", "Ref No", "Date", "Time"
    ];
    const escapeCSV = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`;
    const csvRows = filteredSeats.map(s => {
      const { table, seat } = parseId(s.id);
      const { date, time } = formatDateTime(s.paymentInfo?.date);
      return [
        escapeCSV(table), escapeCSV(seat), escapeCSV(s.id), escapeCSV(s.paymentInfo?.studentName),
        escapeCSV(s.paymentInfo?.studentId), escapeCSV(s.paymentInfo?.isMember ? 'Yes' : 'No'),
        escapeCSV(s.paymentInfo?.isVegan ? 'Yes' : 'No'), escapeCSV(s.status),
        escapeCSV(s.paymentInfo?.refNo), escapeCSV(date), escapeCSV(time)
      ].join(",");
    });
    const blob = new Blob([[headers.join(","), ...csvRows].join("\n")], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "thundering_hooves_data.csv";
    link.click();
  };

  const handleDelete = async (seat: SeatData) => {
    if (processingId) return;
    if (window.confirm(`Are you sure you want to PHYSICALLY DELETE booking for Seat T${seat.tableId}-${seat.seatNumber}? This cannot be undone.`)) {
      setProcessingId(seat.id);
      try { 
        setRemovedIds(prev => new Set([...prev, seat.id]));
        await onReset(seat.id); 
      } catch (err) {
        setRemovedIds(prev => {
          const next = new Set(prev);
          next.delete(seat.id);
          return next;
        });
        alert("Failed to delete booking.");
      } finally { 
        setProcessingId(null); 
      }
    }
  };

  const handleDecline = async (seat: SeatData) => {
    if (processingId) return;
    if (window.confirm('Are you sure you want to DECLINE this booking? The seat will become available again.')) {
      setProcessingId(seat.id);
      try {
        setRemovedIds(prev => new Set([...prev, seat.id]));
        await onReset(seat.id); // App.tsx updated onReset to use deleteBooking
      } catch (err) {
        setRemovedIds(prev => {
          const next = new Set(prev);
          next.delete(seat.id);
          return next;
        });
        alert("Failed to decline booking.");
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleApprove = async (seat: SeatData) => {
    if (processingId || !onApprove) return;
    setProcessingId(seat.id);
    try {
      await onApprove(seat);
    } catch (err) {
      alert("Failed to approve booking.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 w-full relative">
      <aside className="lg:w-64 shrink-0">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-4 md:p-6 sticky top-24 space-y-4">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar">
            {[
              { id: 'financials', label: 'Finance', icon: PieChart },
              { id: 'map', label: 'Hall Map', icon: MapIcon },
              { id: 'manifest', label: 'Guest List', icon: List },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all whitespace-nowrap min-w-fit flex-1 lg:flex-none ${activeView === item.id ? 'bg-[#d4af37] text-[#5c1a1a]' : 'text-white/40 hover:bg-white/5'}`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="pt-6 border-t border-white/5 space-y-3">
             <div className="flex items-center gap-2 px-2 mb-2">
                <Wand2 className="w-3 h-3 text-[#d4af37]" />
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">🔮 Admin FX Preview</span>
             </div>
             <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => onPreviewAura?.('PLATINUM')}
                  className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-600/20 transition-all"
                >
                  Force Platinum
                </button>
                <button 
                  onClick={() => onPreviewAura?.('GOLD')}
                  className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-500/20 transition-all"
                >
                  Force Gold
                </button>
                <button 
                  onClick={() => onPreviewAura?.('SILVER')}
                  className="w-full py-2 bg-stone-500/10 hover:bg-stone-500/20 text-stone-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-stone-500/20 transition-all"
                >
                  Force Silver
                </button>
             </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 view-transition">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-white font-serif font-black text-2xl uppercase tracking-widest">Master Control</h2>
          <button 
            onClick={onLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-red-900/20"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {activeView === 'financials' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] flex flex-col gap-4">
                <div>
                  <TrendingUp className="text-emerald-400 w-6 h-6 mb-4" />
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Gross Sales</p>
                  <p className="text-3xl font-black text-white font-mono">RM {stats.totalRevenue.toFixed(2)}</p>
                </div>
                
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] text-[#d4af37] uppercase tracking-widest mb-2 font-black">Net Profit (RM)</p>
                  <p className="text-4xl font-black text-[#d4af37] font-mono drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">RM {stats.netProfit.toFixed(2)}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                   <label className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2 block">Deduct Expenses (RM)</label>
                   <div className="relative">
                      <MinusCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500/50" />
                      <input 
                        type="number" 
                        value={deduction} 
                        onChange={(e) => setDeduction(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                        placeholder="e.g. 50"
                      />
                   </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
                <UserCheck className="text-amber-400 w-6 h-6 mb-4" />
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Occupancy</p>
                <p className="text-3xl font-black text-white font-mono">{stats.soldCount}/{stats.totalCapacity}</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
                <Utensils className="text-green-400 w-6 h-6 mb-4" />
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Meals (V/S)</p>
                <p className="text-3xl font-black text-white font-mono">{stats.vegan} / {stats.standard}</p>
              </div>
            </div>
          </div>
        )}

        {activeView === 'map' && (
          <div className="bg-black/20 border border-white/10 rounded-[40px] p-10 space-y-12 overflow-x-auto no-scrollbar">
            <div>
              <SectionHeader tier={SeatTier.PLATINUM} label="PLATINUM" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14 py-4 place-items-center">
                {(Object.entries(seatsByTable) as [string, SeatData[]][]).filter(([id]) => parseInt(id) <= 6).map(([id, tSeats]) => (
                  <RoundTable key={id} tableId={parseInt(id)} seats={tSeats} tier={SeatTier.PLATINUM} onSeatClick={(sid) => onSelectSeat(seats.find(s => s.id === sid)!)} />
                ))}
              </div>
            </div>
            
            <div>
              <SectionHeader tier={SeatTier.GOLD} label="GOLD" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14 py-4 place-items-center">
                {(Object.entries(seatsByTable) as [string, SeatData[]][]).filter(([id]) => { const tid = parseInt(id); return tid > 6 && tid <= 10; }).map(([id, tSeats]) => (
                  <RoundTable key={id} tableId={parseInt(id)} seats={tSeats} tier={SeatTier.GOLD} onSeatClick={(sid) => onSelectSeat(seats.find(s => s.id === sid)!)} />
                ))}
              </div>
            </div>

            <div>
              <SectionHeader tier={SeatTier.SILVER} label="SILVER" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14 py-4 place-items-center">
                {(Object.entries(seatsByTable) as [string, SeatData[]][]).filter(([id]) => { const tid = parseInt(id); return tid > 10; }).map(([id, tSeats]) => (
                  <RoundTable key={id} tableId={parseInt(id)} seats={tSeats} tier={SeatTier.SILVER} onSeatClick={(sid) => onSelectSeat(seats.find(s => s.id === sid)!)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'manifest' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative flex-1 w-full md:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" placeholder="Search guests..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#d4af37]/50" />
              </div>
              <button 
                onClick={handleExportCSV}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
            <div className="bg-black/20 border border-white/10 rounded-[32px] overflow-x-auto shadow-2xl">
              <table className="w-full text-left min-w-[1100px]">
                <thead className="text-[10px] text-white/30 uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">T/S</th>
                    <th className="px-6 py-4">Guest</th>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Meal</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Ref</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSeats.map(s => {
                    const { table, seat } = parseId(s.id);
                    return (
                      <tr key={s.id} className="text-white/80 group hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-mono font-bold text-xs">{table}-{seat}</td>
                        <td className="px-6 py-4 font-black text-xs uppercase">{s.paymentInfo?.studentName}</td>
                        <td className="px-6 py-4 font-mono text-xs opacity-50">{s.paymentInfo?.studentId}</td>
                        <td className="px-6 py-4 text-xs">{s.paymentInfo?.isVegan ? 'Vegan' : 'Standard'}</td>
                        <td className="px-6 py-4"><span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${s.status === SeatStatus.SOLD ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{s.status}</span></td>
                        <td className="px-6 py-4 font-mono text-[10px] opacity-40">{s.paymentInfo?.refNo}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                             {s.status === SeatStatus.PENDING && (
                               <>
                                 <button 
                                   onClick={() => handleApprove(s)}
                                   className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                   title="Approve"
                                 >
                                   <CheckCircle2 className="w-5 h-5" />
                                 </button>
                                 <button 
                                   onClick={() => handleDecline(s)}
                                   className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                   title="Decline"
                                 >
                                   <XCircle className="w-5 h-5" />
                                 </button>
                               </>
                             )}
                             <button onClick={() => onSelectSeat(s)} className="p-2 text-white/40 hover:text-white" title="View Details"><Eye className="w-4 h-4" /></button>
                             <button onClick={() => handleDelete(s)} className="p-2 text-white/40 hover:text-red-500" title="Delete/Reset"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
