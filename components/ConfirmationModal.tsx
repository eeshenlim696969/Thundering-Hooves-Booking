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
          email: '',
          phone: '',
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

  // --- UPDATED VALIDATION ---
  const isFormValid = seats.length > 0 && seats.every(seat => {
    const d = details[seat.id];
    if (!d) return false;
    
    const commonFields = d.studentName.trim().length >= 3 && d.email.includes('@') && d.phone.length >= 8;
    
    if (d.category === 'OUTSIDER') {
      return commonFields && d.icNumber && d.icNumber.length >= 6 && d.carPlate;
    } else {
      return commonFields && d.studentId && d.studentId.length >= 2;
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
           <span className="text-xs font-black uppercase tracking-widest font-mono">
             Hall Lock: {formatTime(timeLeft)}
           </span>
        </div>

        <div className="p-6 border-b border-stone-100 bg-[#fafafa] flex items-center shrink-0">
          <div className="bg-[#5c1a1a] p-3 rounded-2xl shadow-lg mr-4">
            <Ticket className="w-6 h-6 text-[#d4af37]" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-black text-stone-900 tracking-tight">Guest Registration</h3>
            <p className="text-[9px] text-stone-400 uppercase tracking-[0.2em] font-black mt-1">Details required for entry</p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar grow space-y-6 bg-stone-50/30">
          {seats.map((seat, index) => {
            const d = details[seat.id] || { category: 'STUDENT', studentName: '', email: '', phone: '', studentId: '', icNumber: '', carPlate: '', isMember: false, isVegan: false };
            const category = d.category;

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

                {/* CATEGORY TOGGLE */}
                <div className="bg-stone-100 p-1 rounded-xl flex gap-1 w-full">
                   {['VITROXIAN', 'STUDENT', 'OUTSIDER'].map((cat) => (
                     <button 
                       key={cat}
                       onClick={() => {
                         updateDetail(seat.id, 'category', cat);
                         if (cat !== 'STUDENT') updateDetail(seat.id, 'isMember', false);
                       }}
                       className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-tighter flex items-center justify-center gap-1.5 transition-all ${category === cat ? 'bg-white shadow-sm text-[#8b0000] ring-1 ring-black/5' : 'text-stone-400 hover:text-stone-600'}`}
                     >
                       {cat === 'VITROXIAN' && <Briefcase className="w-3 h-3" />}
                       {cat === 'STUDENT' && <GraduationCap className="w-3 h-3" />}
                       {cat === 'OUTSIDER' && <Car className="w-3 h-3" />}
                       {cat.replace('STUDENT', 'ViTrox Student')}
                     </button>
                   ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Row */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><User className="w-3 h-3" /> Name</label>
                    <input type="text" placeholder="Full Name" value={d.studentName} onChange={(e) => updateDetail(seat.id, 'studentName', e.target.value)} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#d4af37]" />
                  </div>

                  {/* ID / IC Row */}
                  {category === 'OUTSIDER' ? (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><CreditCard className="w-3 h-3" /> IC Number</label>
                      <input type="text" placeholder="990101-07-XXXX" value={d.icNumber} onChange={(e) => updateDetail(seat.id, 'icNumber', e.target.value)} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#d4af37]" />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Users className="w-3 h-3" /> ID Number</label>
                      <input type="text" placeholder="ID Number" value={d.studentId} onChange={(e) => updateDetail(seat.id, 'studentId', e.target.value)} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#d4af37]" />
                    </div>
                  )}

                  {/* Contact Row */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                    <input type="email" placeholder="email@example.com" value={d.email} onChange={(e) => updateDetail(seat.id, 'email', e.target.value)} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#d4af37]" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</label>
                    <input type="tel" placeholder="012-XXXXXXX" value={d.phone} onChange={(e) => updateDetail(seat.id, 'phone', e.target.value)} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#d4af37]" />
                  </div>

                  {/* Car Plate for Outsiders */}
                  {category === 'OUTSIDER' && (
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Car className="w-3 h-3" /> Car Plate</label>
                      <input type="text" placeholder="PAA 1234" value={d.carPlate} onChange={(e) => updateDetail(seat.id, 'carPlate', e.target.value)} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#d4af37]" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  {category === 'STUDENT' && (
                    <button onClick={() => updateDetail(seat.id, 'isMember', !d.isMember)} className={`flex-1 py-2.5 rounded-xl border-2 text-[9px] font-black uppercase transition-all ${d.isMember ? 'bg-amber-50 border-[#d4af37] text-amber-700' : 'bg-white border-stone-100 text-stone-300'}`}>Club Member</button>
                  )}
                  <button onClick={() => updateDetail(seat.id, 'isVegan', !d.isVegan)} className={`flex-1 py-2.5 rounded-xl border-2 text-[9px] font-black uppercase transition-all ${d.isVegan ? 'bg-green-50 border-green-600 text-green-700' : 'bg-white border-stone-100 text-stone-300'}`}>Vegan Meal</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-[#fafafa] border-t border-stone-100 shrink-0">
           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="text-center md:text-left">
               <span className="font-black text-stone-400 uppercase text-[9px] tracking-[0.3em]">TOTAL DUE</span>
               <div className="text-2xl font-black text-[#5c1a1a] font-mono leading-none">RM {totalPrice.toFixed(2)}</div>
             </div>
             <button
               onClick={handleConfirmAction}
               disabled={!isFormValid || timeLeft === 0 || isSubmitting}
               className="w-full md:w-auto px-10 py-4 bg-[#d4af37] disabled:bg-stone-200 text-[#5c1a1a] font-black uppercase tracking-[0.1em] rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
             >
               {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Proceed'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
