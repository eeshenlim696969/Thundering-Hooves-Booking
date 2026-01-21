import React, { useState } from 'react';
import { X, Lock, KeyRound, Loader2, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    setTimeout(() => {
        if (password === 'admin123') {
            onLogin();
            setPassword('');
        } else {
            setError(true);
        }
        setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative border border-stone-200">
            <div className="p-8 pb-6 text-center">
                <div className="w-16 h-16 bg-stone-900 text-amber-400 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-stone-200 transform rotate-3">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900">Authorized Access</h3>
                <p className="text-sm text-stone-500 mt-2">Staff passcode required for Hall Control.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-4">
                <div className="relative">
                    <KeyRound className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError(false);
                        }}
                        placeholder="Passcode"
                        className={`w-full pl-10 pr-4 py-3 bg-stone-50 border rounded-xl outline-none focus:ring-2 transition-all ${error ? 'border-red-300 focus:ring-red-200' : 'border-stone-200 focus:ring-stone-200'}`}
                        autoFocus
                    />
                </div>
                
                {error && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg text-center font-medium animate-shake">
                        Passcode incorrect.
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading || !password}
                    className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter Hall Control'}
                </button>

                <button 
                  type="button"
                  onClick={onClose} 
                  disabled={loading}
                  className="w-full h-11 border border-yellow-600/50 text-yellow-500 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] transition-all hover:bg-yellow-600/5 flex items-center justify-center"
                >
                  Cancel
                </button>
            </form>
        </div>
    </div>
  );
};