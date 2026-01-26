
import React, { useState, useEffect } from 'react';
import { SeatData, SeatStatus, SeatTier, SeatDetail } from '../types';
import { X, Ticket, ShieldCheck, ArrowRight, Leaf, User, Fingerprint, Clock, Trash2, ChevronLeft, Loader2, Users } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  timeLeft: number;
  onClose: () => void;
  onConfirm: (details: Record<string, SeatDetail>) => void;
  onRemoveSeat?: (id: string) => void;
  onModifySelection?: () => void;
  seats: SeatData[];
}

const MEMBER_DISCOUNT_AMOUNT = 1.00;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, timeLeft, onClose, onConfirm, onRemoveSeat, seats }) => {
  const [details, setDetails] = useState<Record<string, SeatDetail>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      return;
    }

    setDetails(prev => {
      const next: Record<string, SeatDetail> = {};
      seats.forEach(seat => {
        // Default studentId is empty, which will force the user to pick from the dropdown
        next[seat.id] = prev[seat.id] || { studentName: '', studentId: '', isMember: false, isVegan: false };
      });
      return next;
    });

    if (seats.length === 0) onClose();
  }, [isOpen, seats, onClose]);

  if (!isOpen) return null;

  const updateDetail = (id: string, field: keyof SeatDetail, value: any) => {
    setDetails(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const totalPrice = seats.reduce((sum, seat) => {
    const d = details[seat.id];
    return sum + (d?.isMember ? seat.price - MEMBER_DISCOUNT_AMOUNT : seat.price);
  }, 0);

  const isFormValid = seats.length > 0 && seats.every(seat => {
    const d = details[seat.id];
    // Form is valid if name is long enough and a category is selected from the dropdown
    return d?.studentName.trim().length >= 3 && d?.studentId.length > 0;
  });

  const handleConfirmAction = async () => {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(details);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden relative border border-stone-200 flex flex-col max-h-[90vh]">
        
        <div className={`px-8 py-3 flex items-center justify-center gap-3 transition-colors ${timeLeft < 60 ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-50 text-amber-900'}`}>
           <Clock className="w-4 h-4" />
           <span className="text-xs font-black uppercase tracking-widest font-mono">
             Hall Lock: {formatTime(timeLeft)}
           </span>
        </div>

        <div className="p-8 pb-6 border-b border-stone-100 bg-[#fafafa] flex items-center shrink-0">
          <div className="bg-[#5c1a1a] p-3 rounded-2xl shadow-lg mr-4">
            <Ticket className="w-6 h-6 text-[#d4af37]" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-black text-stone-900 tracking-tight">Seat Details</h3>
            <p className="text-[10px] text-stone-400 uppercase tracking-[0.3em] font-black mt-2">Registration Required</p>
          </div>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar grow space-y-8 bg-stone-50/30">
          <div className="grid gap-6">
            {seats.map((seat, index) => {
              const d = details[seat.id] || { studentName: '', studentId: '', isMember: false, isVegan: false };
              return (
                <div key={seat.id} className="bg-white p-6 rounded-[32px] border border-stone-200 shadow-sm space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#5c1a1a]" />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-black">{index + 1}</span>
                      {/* UPDATED: Manual change to Table 3A */}
                      <h4 className="font-black text-stone-900 uppercase">Table 3A / Seat {seat.seatNumber}</h4>
                    </div>
                    <button onClick={() => onRemoveSeat?.(seat.id)} className="p-2 text-stone-300 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><User className="w-3 h-3" /> Full Name</label>
                      <input type="text" placeholder="Attendee Name" value={d.studentName} onChange={(e) => updateDetail(seat.id, 'studentName', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none" />
                    </div>
                    
                    {/* UPDATED: Dropdown Selection for ID/Category */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Users className="w-3 h-3" /> Attendee Type</label>
                      <select 
                        value={d.studentId} 
                        onChange={(e) => updateDetail(seat.id, 'studentId', e.target.value)} 
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none appearance-none cursor-pointer hover:border-amber-300 transition-colors"
                      >
                        <option value="">-- Select Category --</option>
                        <option value="Outsider">Outsider</option>
                        <option value="Vitroxian">Vitroxian</option>
                        <option value="VitroxStudent">ViTrox Student</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => updateDetail(seat.id, 'isMember', !d.isMember)} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${d.isMember ? 'bg-amber-50 border-[#d4af37] text-amber-700' : 'bg-white border-stone-100 text-stone-300'}`}>Club Member</button>
                    <button onClick={() => updateDetail(seat.id, 'isVegan', !d.isVegan)} className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${d.isVegan ? 'bg-green-50 border-green-600 text-green-700' : 'bg-white border-stone-100 text-stone-300'}`}>Vegan Meal</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-8 bg-[#fafafa] border-t border-stone-100 shrink-0 space-y-4">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
             <div>
               <span className="font-black text-stone-400 uppercase text-[10px] tracking-[0.3em]">TOTAL DUE</span>
               <div className="text-3xl font-black text-[#5c1a1a] font-mono">RM {totalPrice.toFixed(2)}</div>
             </div>
             <button
               onClick={handleConfirmAction}
               disabled={!isFormValid || timeLeft === 0 || isSubmitting}
               className="w-full md:w-auto px-10 py-5 bg-[#d4af37] disabled:bg-stone-200 text-[#5c1a1a] font-black uppercase tracking-[0.2em] rounded-[24px] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
             >
               {isSubmitting ? (
                 <>Processing... <Loader2 className="w-6 h-6 animate-spin" /></>
               ) : (
                 <>Proceed to Checkout <ArrowRight className="w-6 h-6" /></>
               )}
             </button>
           </div>
           <button onClick={onClose} disabled={isSubmitting} className="w-full h-11 border border-yellow-600/50 text-yellow-500 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center transition-opacity hover:opacity-80">
             Cancel Registration
           </button>
        </div>
      </div>
    </div>
  );
};
