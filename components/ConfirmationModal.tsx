import React, { useState, useEffect } from 'react';
import { SeatData, SeatDetail } from '../types';
import { X, Ticket, User, Clock, Trash2, Loader2, Users, CreditCard, Car, GraduationCap, Briefcase, Mail, Phone } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  timeLeft: number;
  onClose: () => void;
  onConfirm: (details: Record<string, SeatDetail>) => void;
  onRemoveSeat?: (id: string) => void;
  seats: SeatData[];
}

const MEMBER_DISCOUNT_AMOUNT = 1.00;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, timeLeft, onClose, onConfirm, onRemoveSeat, seats }) => {
  const [details, setDetails] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) { setIsSubmitting(false); return; }
    setDetails(prev => {
      const next: Record<string, any> = {};
      seats.forEach(seat => {
        next[seat.id] = prev[seat.id] || { category: 'STUDENT', studentName: '', studentId: '', isMember: false, isVegan: false };
      });
      return next;
    });
  }, [isOpen, seats]);

  if (!isOpen) return null;

  const updateDetail = (id: string, field: string, value: any) => {
    setDetails(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const totalPrice = seats.reduce((sum, seat) => {
    const d = details[seat.id];
    return sum + (d?.isMember ? seat.price - MEMBER_DISCOUNT_AMOUNT : seat.price);
  }, 0);

  const isFormValid = seats.every(seat => {
    const d = details[seat.id];
    if (!d || d.studentName.trim().length < 3) return false;
    if (d.category === 'OUTSIDER') {
      return (d.icNumber?.length || 0) > 5 && (d.carPlate?.trim().length || 0) > 1 && d.email?.includes('@') && (d.phone?.length || 0) > 7;
    }
    return (d.studentId?.trim().length || 0) > 1;
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className={`px-8 py-3 flex items-center justify-center gap-3 transition-colors ${timeLeft < 60 ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-50 text-amber-900'}`}>
           <Clock className="w-4 h-4" />
           <span className="text-xs font-black uppercase font-mono">Hall Lock: {formatTime(timeLeft)}</span>
        </div>

        <div className="p-6 border-b border-stone-100 bg-[#fafafa] flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-[#5c1a1a] p-3 rounded-2xl mr-4 shadow-lg"><Ticket className="w-6 h-6 text-[#d4af37]" /></div>
            <h3 className="text-2xl font-serif font-black text-stone-900 tracking-tight">Registration</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X className="w-6 h-6 text-stone-400" /></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 bg-stone-50/30 grow">
          {seats.map((seat, index) => {
            const d = details[seat.id] || {};
            return (
              <div key={seat.id} className="bg-white p-6 rounded-[32px] border border-stone-200 shadow-sm space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#5c1a1a]" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-black">{index + 1}</span>
                    <h4 className="font-black text-stone-900 uppercase">Table {seat.tableId === 4 ? '3A' : seat.tableId} / Seat {seat.seatNumber}</h4>
                  </div>
                  <button onClick={() => onRemoveSeat?.(seat.id)} className="p-2 text-stone-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>

                <div className="bg-stone-100 p-1 rounded-xl flex gap-1">
                   {(['VITROXIAN', 'STUDENT', 'OUTSIDER'] as const).map((cat) => (
                     <button key={cat} onClick={() => {
                        updateDetail(seat.id, 'category', cat);
                        if (cat !== 'STUDENT') updateDetail(seat.id, 'isMember', false);
                     }}
                       className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${d.category === cat ? 'bg-white shadow-sm text-[#8b0000] ring-1 ring-black/5' : 'text-stone-400 hover:text-stone-600'}`}
                     >
                       {cat === 'STUDENT' ? 'ViTrox Student' : cat}
                     </button>
                   ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><User className="w-3 h-3" /> Full Name</label>
                    <input type="text" placeholder="Full Name" value={d.studentName} onChange={(e) => updateDetail(seat.id, 'studentName', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#d4af37]" />
                  </div>

                  {d.category === 'OUTSIDER' ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><CreditCard className="w-3 h-3" /> IC Number</label>
                        <input type="text" placeholder="IC Number" value={d.icNumber} onChange={(e) => updateDetail(seat.id, 'icNumber', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#d4af37]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                        <input type="email" placeholder="Email" value={d.email} onChange={(e) => updateDetail(seat.id, 'email', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#d4af37]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</label>
                        <input type="tel" placeholder="Phone" value={d.phone} onChange={(e) => updateDetail(seat.id, 'phone', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#d4af37]" />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Car className="w-3 h-3" /> Car Plate</label>
                        <input type="text" placeholder="PAA 1234" value={d.carPlate} onChange={(e) => updateDetail(seat.id, 'carPlate', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#d4af37]" />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Users className="w-3 h-3" /> {d.category === 'VITROXIAN' ? 'Staff ID' : 'Student ID'}</label>
                      <input type="text" placeholder="ID Number" value={d.studentId} onChange={(e) => updateDetail(seat.id, 'studentId', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#d4af37]" />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  {d.category === 'STUDENT' && (
                    <button onClick={() => updateDetail(seat.id, 'isMember', !d.isMember)} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${d.isMember ? 'bg-amber-50 border-[#d4af37] text-amber-700' : 'bg-white border-stone-100 text-stone-300'}`}>Club Member</button>
                  )}
                  <button onClick={() => updateDetail(seat.id, 'isVegan', !d.isVegan)} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${d.isVegan ? 'bg-green-50 border-green-600 text-green-700' : 'bg-white border-stone-100 text-stone-300'}`}>Vegan Meal</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-8 bg-[#fafafa] border-t border-stone-100 shrink-0 space-y-4">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
             <div>
               <span className="font-black text-stone-400 uppercase text-[10px] tracking-[0.3em]">TOTAL DUE</span>
               <div className="text-3xl font-black text-[#5c1a1a] font-mono leading-none">RM {totalPrice.toFixed(2)}</div>
             </div>
             <button onClick={() => onConfirm(details as any)} disabled={!isFormValid || timeLeft === 0 || isSubmitting}
               className="w-full md:w-auto px-10 py-5 bg-[#d4af37] disabled:bg-stone-200 text-[#5c1a1a] font-black uppercase tracking-[0.2em] rounded-[24px] shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
             >
               {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm & Pay'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
