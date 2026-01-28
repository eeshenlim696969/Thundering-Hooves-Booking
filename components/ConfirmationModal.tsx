import React, { useState, useEffect } from 'react';
import { SeatData, SeatDetail, VisitorCategory } from '../types';
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

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, timeLeft, onClose, onConfirm, onRemoveSeat, seats 
}) => {
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
        next[seat.id] = prev[seat.id] || { 
          category: 'STUDENT', 
          studentName: '', 
          email: '', // Optional for internals
          phone: '', // Optional for internals
          studentId: '', 
          icNumber: '',
          carPlate: '',
          isMember: false, 
          isVegan: false 
        };
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

  // --- STRICT VALIDATION LOGIC ---
  const isFormValid = seats.length > 0 && seats.every(seat => {
    const d = details[seat.id];
    if (!d) return false;
    
    const hasName = d.studentName.trim().length >= 3;
    
    if (d.category === 'OUTSIDER') {
      // OUTSIDER: Must have Name, Email, Phone, IC, and Car Plate
      return hasName && 
             d.email?.includes('@') && 
             d.phone?.length >= 8 && 
             d.icNumber?.length >= 6 && 
             d.carPlate?.trim().length >= 2;
    } else {
      // VITROXIAN / STUDENT: Only Name and ID needed
      return hasName && d.studentId && d.studentId.trim().length >= 2;
    }
  });

  const handleConfirmAction = async () => {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(details as Record<string, SeatDetail>);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden relative border border-stone-200 flex flex-col max-h-[90vh]">
        
        <div className={`px-8 py-3 flex items-center justify-center gap-3 transition-colors ${timeLeft < 60 ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-50 text-amber-900'}`}>
           <Clock className="w-4 h-4" />
           <span className="text-xs font-black uppercase tracking-widest font-mono">Hall Lock: {formatTime(timeLeft)}</span>
        </div>

        <div className="p-6 border-b border-stone-100 bg-[#fafafa] flex items-center shrink-0">
          <div className="bg-[#5c1a1a] p-3 rounded-2xl shadow-lg mr-4">
            <Ticket className="w-6 h-6 text-[#d4af37]" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-black text-stone-900 tracking-tight">Booking Details</h3>
            <p className="text-[9px] text-stone-400 uppercase tracking-[0.2em] font-black mt-1">Select category and fill in info</p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar grow space-y-6 bg-stone-50/30">
          {seats.map((seat, index) => {
            const d = details[seat.id] || { category: 'STUDENT' };
            const isOutsider = d.category === 'OUTSIDER';

            return (
              <div key={seat.id} className="bg-white p-5 rounded-[28px] border border-stone-200 shadow-sm space-y-5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5c1a1a]" />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-black">{index + 1}</span>
                    <h4 className="font-black text-stone-900 text-sm uppercase">Table {seat.tableId === 4 ? '3A' : seat.tableId} / Seat {seat.seatNumber}</h4>
                  </div>
                  <button onClick={() => onRemoveSeat?.(seat.id)} className="p-2 text-stone-300 hover:text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>

                <div className="bg-stone-100 p-1 rounded-xl flex gap-1 w-full">
                   {(['VITROXIAN', 'STUDENT', 'OUTSIDER'] as const).map((cat) => (
                     <button key={cat} onClick={() => { updateDetail(seat.id, 'category', cat); }}
                       className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter flex items-center justify-center gap-1.5 transition-all ${d.category === cat ? 'bg-white shadow-sm text-[#8b0000] ring-1 ring-black/5' : 'text-stone-400 hover:text-stone-600'}`}
                     >
                       {cat === 'VITROXIAN' && <Briefcase className="w-3 h-3" />}
                       {cat === 'STUDENT' && <GraduationCap className="w-3 h-3" />}
                       {cat === 'OUTSIDER' && <Car className="w-3 h-3" />}
                       {cat === 'STUDENT' ? 'ViTrox Student' : cat}
                     </button>
                   ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><User className="w-3 h-3" /> Full Name</label>
                    <input type="text" placeholder="Full Name" value={d.studentName} onChange={(e) => updateDetail(seat.id, 'studentName', e.target.value)} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#d4af37]" />
                  </div>

                  {!isOutsider ? (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Users className="w-3 h-3" /> ID Number</label>
                      <input type="text" placeholder="Staff/Student ID" value={d.studentId} onChange={(e) => updateDetail(seat.id, 'studentId', e.target.value)} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#d4af37]" />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><CreditCard className="w-3 h-3" /> IC Number</label>
                      <input type="text" placeholder="IC Number" value={d.icNumber} onChange={(e) => updateDetail(seat.id, 'icNumber', e.target.value)} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#d4af37]" />
                    </div>
                  )}

                  {/* SHOW THESE ONLY FOR OUTSIDERS */}
                  {isOutsider && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                        <input type="email" placeholder="email@example.com" value={d.email} onChange={(e) => updateDetail(seat.id, 'email', e.target.value)} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#d4af37]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</label>
                        <input type="tel" placeholder="Phone Number" value={d.phone} onChange={(e) => updateDetail(seat.id, 'phone', e.target.value)} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#d4af37]" />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Car className="w-3 h-3" /> Car Plate Number</label>
                        <input type="text" placeholder="e.g. PAA 1234" value={d.carPlate} onChange={(e) => updateDetail(seat.id, 'carPlate', e.target.value)} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#d4af37]" />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  {d.category === 'STUDENT' && (
                    <button onClick={() => updateDetail(seat.id, 'isMember', !d.isMember)} className={`flex-1 py-2.5 rounded-xl border-2 text-[9px] font-black uppercase transition-all ${d.isMember ? 'bg-amber-50 border-[#d4af37] text-amber-700' : 'bg-white border-stone-100 text-stone-300'}`}>Club Member</button>
                  )}
                  <button onClick={() => updateDetail(seat.id, 'isVegan', !d.isVegan)} className={`flex-1 py-2.5 rounded-xl border-2 text-[9px] font-black uppercase transition-all ${d.isVegan ? 'bg-green-50 border-green-600 text-green-700' : 'bg-white border-stone-100 text-stone-300'}`}>Vegan Meal</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-[#fafafa] border-t border-stone-100 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
           <div>
             <span className="font-black text-stone-400 uppercase text-[9px] tracking-[0.3em]">TOTAL DUE</span>
             <div className="text-2xl font-black text-[#5c1a1a] font-mono leading-none">RM {totalPrice.toFixed(2)}</div>
           </div>
           <button onClick={handleConfirmAction} disabled={!isFormValid || timeLeft === 0 || isSubmitting}
             className="w-full md:w-auto px-10 py-4 bg-[#d4af37] disabled:bg-stone-200 text-[#5c1a1a] font-black uppercase tracking-[0.1em] rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
           >
             {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Proceed'}
           </button>
        </div>
      </div>
    </div>
  );
};
