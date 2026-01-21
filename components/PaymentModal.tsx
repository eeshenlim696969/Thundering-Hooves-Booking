
import React, { useState } from 'react';
import { submitBatchBookingRequest } from '../services/firebase';
import { CheckCircle2, Loader2, Upload, Clock, ShieldCheck, AlertCircle, Camera } from 'lucide-react';
import { SeatStatus, SeatData, PaymentConfig } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  timeLeft: number;
  onClose: () => void;
  amount: number;
  count: number;
  onConfirm: () => void;
  paymentConfig: PaymentConfig;
  pendingDetails: Record<string, any>;
  seats: SeatData[];
}

const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 500; 
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Canvas failure."));
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'low';
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Compression failed.'));
          }
        }, 'image/jpeg', 0.5);
      };
      img.onerror = () => reject(new Error('Invalid image file.'));
    };
    reader.onerror = () => reject(new Error('Read error.'));
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, timeLeft, onClose, amount, count, onConfirm, paymentConfig, pendingDetails
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'optimizing' | 'securing'>('idle');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [referenceNo, setReferenceNo] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Updated size check: 950KB
      if (file.size > 950 * 1024) { 
        alert('File is too large! Please crop your screenshot or compress the PDF to under 1MB.');
        setErrorMsg("File too large (Max 950KB)");
        return;
      }
      setReceipt(file);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async () => {
    if (!receipt || !referenceNo || loadingState !== 'idle') return;
    setErrorMsg(null);
    
    try {
      setLoadingState('optimizing');
      let finalBlob: Blob;
      
      // Compress if image, skip if PDF
      if (receipt.type !== 'application/pdf') {
        finalBlob = await compressImage(receipt);
      } else {
        finalBlob = receipt;
      }
      
      const base64Data = await blobToBase64(finalBlob);
      
      setLoadingState('securing');
      const nowString = new Date().toISOString();
      const bookings = Object.keys(pendingDetails).map(seatId => ({
        seatId,
        data: {
          paymentInfo: {
            ...pendingDetails[seatId],
            refNo: referenceNo.trim().toUpperCase(),
            receiptImage: base64Data,
            date: nowString
          },
          status: SeatStatus.PENDING,
          lockedAt: Date.now()
        }
      }));

      await submitBatchBookingRequest(bookings);
      
      setIsSuccess(true);
      setLoadingState('idle'); 
      setTimeout(() => onConfirm(), 500);
    } catch (error: any) {
      console.error("Submission error:", error);
      setErrorMsg(error.message || "Failed to secure entry. Please check network.");
      setLoadingState('idle');
    }
  };

  const isFinalizing = loadingState === 'securing' || isSuccess;
  const isReady = receipt && referenceNo.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-xl animate-fade-in">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border-[8px] md:border-[12px] border-[#5c1a1a] flex flex-col max-h-[95vh] relative">
        
        <div className={`px-8 py-3 flex items-center justify-center gap-3 transition-colors ${timeLeft < 60 && timeLeft > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-50 text-amber-900'}`}>
           <Clock className="w-4 h-4" />
           <span className="text-xs font-black uppercase tracking-widest font-mono">Session: {timeLeft > 0 ? formatTime(timeLeft) : 'EXPIRED'}</span>
        </div>

        <div className="bg-[#5c1a1a] p-6 text-center border-b-4 border-[#d4af37]">
           <h3 className="text-xl md:text-2xl font-serif font-black text-[#fef9c3] tracking-widest uppercase">Secure Hall Entry</h3>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-6">
          {isSuccess ? (
             <div className="py-20 text-center space-y-4 animate-slide-up">
               <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
               <h3 className="text-2xl font-serif font-black text-stone-900">Success</h3>
               <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">Registration Secured</p>
             </div>
          ) : (
            <>
              <div className="bg-stone-950 p-6 rounded-[30px] flex justify-between items-center text-white border border-white/5 shadow-inner">
                 <div>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Fee Total</p>
                    <p className="text-2xl md:text-3xl font-mono font-black">RM {amount.toFixed(2)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-widest mb-1">Positions</p>
                    <p className="text-2xl font-serif font-black text-[#fef9c3]">{count} Seats</p>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="text-center bg-stone-50 p-6 rounded-[40px] border-2 border-dashed border-stone-200">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Transfer QR / Details</p>
                  <img src={paymentConfig.tngQrUrl} className="w-48 h-auto mx-auto mb-4 bg-white p-3 rounded-2xl shadow-sm border border-stone-100" />
                  <p className="text-[12px] font-black text-stone-900">{paymentConfig.bankName} • {paymentConfig.bankAccountNumber}</p>
                </div>

                <div className="space-y-4">
                  {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-2">Reference No</label>
                    <input 
                      disabled={loadingState !== 'idle'} 
                      type="text" 
                      value={referenceNo} 
                      onChange={e => setReferenceNo(e.target.value.toUpperCase())} 
                      placeholder="e.g. TNG-123456" 
                      className="w-full p-4 bg-white border-2 border-stone-100 rounded-2xl outline-none focus:border-[#d4af37] font-mono text-sm shadow-sm" 
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col items-center gap-2">
                       <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2">
                          <Camera className="w-4 h-4" /> Evidence of Payment Required
                       </p>
                       <p className="text-[9px] text-amber-700/80 font-bold uppercase text-center leading-relaxed">
                         Please take a screenshot of your TNG/Bank receipt and upload it here.
                       </p>
                    </div>

                    <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all hover:bg-stone-50 shadow-sm ${receipt ? 'bg-green-50 border-green-600/50' : 'bg-stone-50 border-stone-200'}`}>
                      {loadingState === 'idle' ? (
                        receipt ? <CheckCircle2 className="w-8 h-8 text-green-500" /> : <Upload className="w-8 h-8 text-stone-300" />
                      ) : (
                        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
                      )}
                      <span className="text-[10px] font-black uppercase mt-3 text-center px-4">
                        {loadingState === 'optimizing' ? 'Optimizing Proof...' : (receipt ? receipt.name : 'Click to upload Receipt Screenshot (Max 1MB)')}
                      </span>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange} 
                        accept="image/*,application/pdf" 
                        disabled={loadingState !== 'idle'} 
                      />
                    </label>
                  </div>

                  <button 
                    onClick={handleSubmit} 
                    disabled={!isReady || loadingState !== 'idle'}
                    className="w-full py-5 bg-[#d4af37] text-[#5c1a1a] rounded-[30px] font-black text-xl uppercase shadow-2xl disabled:bg-stone-100 disabled:text-stone-300 active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                       {loadingState === 'idle' ? 'Confirm Entry' : `${loadingState.charAt(0).toUpperCase() + loadingState.slice(1)}...`}
                       <ShieldCheck className={`w-6 h-6 ${loadingState !== 'idle' ? 'animate-pulse' : ''}`} />
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-stone-100 bg-white shrink-0">
          <button 
            onClick={onClose} 
            disabled={isFinalizing}
            className="w-full py-4 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all border border-stone-100 active:scale-95 disabled:opacity-20"
          >
            Cancel Registration
          </button>
        </div>
      </div>
    </div>
  );
};
