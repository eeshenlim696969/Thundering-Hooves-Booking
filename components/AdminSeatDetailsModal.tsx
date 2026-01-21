import React, { useState } from 'react';
import { SeatData, SeatStatus } from '../types';
import { X, Trash2, Leaf, CheckCircle2, Eye, Loader2, ShieldCheck, RotateCcw, FileText, Download, Hash } from 'lucide-react';

interface AdminSeatDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seat: SeatData | null;
  onReset: (seatId: string) => Promise<void>;
  onUpdateStatus: (seatId: string, status: SeatStatus, details?: any) => Promise<void>;
  onSync: (data: any) => Promise<any>;
}

export const AdminSeatDetailsModal: React.FC<AdminSeatDetailsModalProps> = ({ isOpen, onClose, seat, onReset, onUpdateStatus, onSync }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedReceipt, setExpandedReceipt] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !seat) return null;

  const handleClose = () => {
    setExpandedReceipt(false);
    setImageError(false);
    onClose();
  };

  const handleWipe = async () => {
    if (window.confirm('Confirm Reset: This will clear all guest data and release the seat.')) {
      setIsProcessing(true);
      try {
        await onReset(seat.id);
        handleClose();
      } catch (error) {
        console.error("Wipe failed:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onUpdateStatus(seat.id, SeatStatus.SOLD, seat.paymentInfo);
      handleClose();
    } catch (error) {
      console.error("Confirmation failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const info = seat.paymentInfo;
  const isPending = seat.status === SeatStatus.PENDING || seat.status === SeatStatus.CHECKOUT;
  const isSold = seat.status === SeatStatus.SOLD;
  const isPdf = info?.receiptImage?.startsWith('data:application/pdf');

  return (
    <>
      {expandedReceipt && info?.receiptImage && !isPdf && (
        <div 
          className="fixed inset-0 z-[3000000] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setExpandedReceipt(false)}
        >
          <img 
            src={info.receiptImage} 
            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg border-2 border-white/10" 
            alt="Guest Proof" 
            onError={() => setImageError(true)}
          />
        </div>
      )}

      <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
        <div className="bg-[#fafafa] rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border border-white/20 flex flex-col max-h-[85vh]">
          
          <div className="p-6 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-black text-stone-900 leading-none">Control Pad</h3>
              <p className="text-[8px] uppercase font-black text-stone-400 mt-1.5 tracking-[0.3em]">Seat T{seat.tableId}-{seat.seatNumber}</p>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X className="w-5 h-5 text-stone-400" /></button>
          </div>

          <div className="flex-1 p-6 space-y-5 overflow-y-auto custom-scrollbar">
            {seat.status === SeatStatus.AVAILABLE ? (
              <div className="py-12 text-center space-y-4">
                <ShieldCheck className="w-12 h-12 text-stone-200 mx-auto" />
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Seat is Currently Empty</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-4 shadow-sm">
                  <div>
                    <p className="text-[7px] font-black text-stone-400 uppercase tracking-widest mb-1">Assigned Attendee</p>
                    <h4 className="text-lg font-black text-stone-900 uppercase break-words">{info?.studentName || 'SYSTEM LOCK'}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                      <p className="text-[7px] font-black text-stone-400 uppercase tracking-widest mb-0.5">Student ID</p>
                      <p className="text-[10px] font-mono font-bold text-stone-700">{info?.studentId || 'N/A'}</p>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                      <p className="text-[7px] font-black text-stone-400 uppercase tracking-widest mb-0.5">Meal Preference</p>
                      <p className={`text-[9px] font-black uppercase ${info?.isVegan ? 'text-green-600' : 'text-stone-400'}`}>{info?.isVegan ? 'Vegan' : 'Standard'}</p>
                    </div>
                  </div>

                  {/* Prominent Payment Reference Number */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Hash className="w-3 h-3 text-amber-600" />
                      <p className="text-[7px] font-black text-amber-600 uppercase tracking-widest">Payment Ref No</p>
                    </div>
                    <p className="text-sm font-black text-amber-900 font-mono tracking-wider break-all">
                      {info?.refNo || 'NOT RECORDED'}
                    </p>
                  </div>

                  {info?.receiptImage && (
                    <div className="space-y-2">
                       <p className="text-[7px] font-black text-stone-400 uppercase tracking-widest">Payment Evidence</p>
                       {isPdf ? (
                         <a 
                           href={info.receiptImage} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="flex items-center justify-center gap-3 w-full py-6 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 font-black uppercase text-[10px] tracking-widest hover:bg-blue-100 transition-all"
                         >
                           <FileText className="w-5 h-5" />
                           📄 Download Receipt
                         </a>
                       ) : (
                         <div className="relative rounded-xl overflow-hidden cursor-zoom-in border border-stone-200 group" onClick={() => setExpandedReceipt(true)}>
                            <img src={info.receiptImage} className="w-full h-32 object-cover transition-transform group-hover:scale-110" alt="Receipt" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-5 h-5 text-white" />
                            </div>
                         </div>
                       )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                   {isPending && (
                     <button 
                       onClick={handleConfirm}
                       disabled={isProcessing}
                       className="flex items-center justify-center gap-2 py-3 bg-[#d4af37] text-[#5c1a1a] rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md hover:brightness-105 active:scale-95 transition-all"
                     >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Confirm</>}
                     </button>
                   )}
                   <button 
                     onClick={handleWipe}
                     disabled={isProcessing}
                     className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border transition-all ${isPending ? 'bg-white border-red-200 text-red-500 hover:bg-red-50' : 'bg-red-500 text-white col-span-2 shadow-lg active:scale-95'}`}
                   >
                     {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RotateCcw className="w-4 h-4" /> {isSold ? 'Refund & Reset' : 'Release'}</>}
                   </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
