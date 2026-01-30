import React, { useState, useEffect } from 'react';
import { SeatData, SeatDetail } from '../types';
import { X, Ticket, User, Clock, Trash2, Loader2, Users, CreditCard, Car, GraduationCap, Briefcase, Phone, Mail } from 'lucide-react';

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
        // Default to Student
        next[seat.id] = prev[seat.id] || { 
          category: 'STUDENT', 
          studentName: '', 
          studentId: '', 
          icNumber: '',
          carPlate: '',
          phoneNumber: '', // Ensure these exist
          email: '',       // Ensure these exist
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

  const isFormValid = seats.length > 0 && seats.every(seat => {
    const d = details[seat.id];
    if (!d) return false;
    
    const hasName = d.studentName.trim().length >= 3;
    
    if (d.category === 'OUTSIDER') {
      // Outsider needs IC + Car Plate + Email + Phone
      return hasName && 
             d.icNumber && d.icNumber.length >= 6 && 
             d.carPlate && d.carPlate.length >= 2 &&
             d.email && d.email.includes('@') &&
             d.phoneNumber && d.phoneNumber.length >= 9;
    } else {
      // Student & Vitroxian need an ID
      return hasName && d.studentId && d.studentId.length >= 2;
    }
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
            <h3 className="text-2xl font-serif font-black text-stone-900 tracking-tight">Guest Registration</h3>
            <p className="text-[10px] text-stone-400 uppercase tracking-[0.3em] font-black mt-2">Please fill in details</p>
          </div>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar grow space-y-8 bg-stone-50/30">
          <div className="grid gap-6">
            {seats.map((seat, index) => {
              const d = details[seat.id] || { category: 'STUDENT', studentName: '', studentId: '', icNumber: '', carPlate: '', phoneNumber: '', email: '', isMember: false, isVegan: false };
              const category = d.category;

              return (
                <div key={seat.id} className="bg-white p-6 rounded-[32px] border border-stone-200 shadow-sm space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#5c1a1a]" />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-black">{index + 1}</span>
                      <h4 className="font-black text-stone-900 uppercase">Table {seat.tableId === 4 ? '3A' : (seat.tableId === 14 ? '13A' : seat.tableId)} / Seat {seat.seatNumber}</h4>
                    </div>
                    <button onClick={() => onRemoveSeat?.(seat.id)} className="p-2 text-stone-300 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  {/* --- 3-WAY CATEGORY TOGGLE --- */}
                  <div className="bg-stone-100 p-1 rounded-xl flex flex-wrap gap-1 w-full">
                      <button 
                        onClick={() => {
                          updateDetail(seat.id, 'category', 'VITROXIAN');
                          updateDetail(seat.id, 'isMember', false); 
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${category === 'VITROXIAN' ? 'bg-white shadow-sm text-purple-700 ring-1 ring-black/5' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                        <Briefcase className="w-3 h-3" /> Vitroxian
                      </button>
                      <button 
                        onClick={() => updateDetail(seat.id, 'category', 'STUDENT')}
                        className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${category === 'STUDENT' ? 'bg-white shadow-sm text-blue-700 ring-1 ring-black/5' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                        <GraduationCap className="w-3 h-3" /> Student
                      </button>
                      <button 
                        onClick={() => {
                          updateDetail(seat.id, 'category', 'OUTSIDER');
                          updateDetail(seat.id, 'isMember', false); 
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${category === 'OUTSIDER' ? 'bg-white shadow-sm text-amber-600 ring-1 ring-black/5' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                        <Car className="w-3 h-3" /> Outsider
                      </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><User className="w-3 h-3" /> Name</label>
                      <input type="text" placeholder="Full Name" value={d.studentName} onChange={(e) => updateDetail(seat.id, 'studentName', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#d4af37]" />
                    </div>
                    
                    {/* DYNAMIC FIELDS */}
                    {category === 'OUTSIDER' ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><CreditCard className="w-3 h-3" /> IC Number</label>
                          <input type="text" placeholder="e.g. 990101-07-1234" value={d.icNumber} onChange={(e) => updateDetail(seat.id, 'icNumber', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#d4af37]" />
                        </div>
                        
                        {/* EMAIL FOR OUTSIDER */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                          <input type="email" placeholder="e.g. user@gmail.com" value={d.email} onChange={(e) => updateDetail(seat.id, 'email', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#d4af37]" />
                        </div>

                        {/* PHONE FOR OUTSIDER */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Phone className="w-3 h-3" /> Phone No.</label>
                          <input type="tel" placeholder="e.g. 0123456789" value={d.phoneNumber} onChange={(e) => updateDetail(seat.id, 'phoneNumber', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#d4af37]" />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Car className="w-3 h-3" /> Car Plate</label>
                          <input type="text" placeholder="e.g. PAA 1234" value={d.carPlate} onChange={(e) => updateDetail(seat.id, 'carPlate', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#d4af37]" />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1"><Users className="w-3 h-3" /> {category === 'VITROXIAN' ? 'Staff / Vitroxian ID' : 'Student ID'}</label>
                        <input type="text" placeholder={category === 'VITROXIAN' ? "e.g. V12345" : "e.g. 2200123"} value={d.studentId} onChange={(e) => updateDetail(seat.id, 'studentId', e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-[#d4af37]" />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-2">
                    {/* ONLY SHOW CLUB MEMBER BUTTON IF CATEGORY IS STUDENT */}
                    {category === 'STUDENT' && (
                      <button 
                        onClick={() => updateDetail(seat.id, 'isMember', !d.isMember)} 
                        className={`flex-1 p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${d.isMember ? 'bg-amber-50 border-[#d4af37] text-amber-700' : 'bg-white border-stone-100 text-stone-300'}`}
                      >
                        Club Member
                      </button>
                    )}
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
                 <>Confirm & Proceed</>
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
