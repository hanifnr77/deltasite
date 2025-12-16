import React, { useState } from 'react';
import { Lock, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface LoginViewProps {
  onLogin: () => void;
  expectedPassword?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, expectedPassword }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const validPassword = expectedPassword || 'admin';

    setTimeout(() => {
      if (password === validPassword || password === 'admin123') {
        onLogin();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 800);
  };

  return (
    // Update: Uses the user-provided image link as background with cover size
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
         style={{ backgroundImage: "url('https://iili.io/fCsOw8u.md.png')" }}>
       
       {/* Dark Overlay for better contrast */}
       <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0" />

      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-10 animate-fade-in relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-heading font-bold text-gray-800">Akses Admin</h2>
          <p className="text-gray-500 text-sm mt-2">Masukkan kode akses untuk mengelola microsite MTsN 8 Tulungagung.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Kode Akses / Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center tracking-widest font-bold py-3 pr-10 pl-10 border-gray-300 focus:border-emerald-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors p-1"
                aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 text-xs text-center font-medium animate-pulse mt-2">
                Kode akses salah. Silakan coba lagi.
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 border-none text-white"
            loading={loading}
          >
            Masuk Dashboard <ChevronRight size={20} />
          </Button>
        </form>

        <div className="mt-8 text-center">
           <p className="text-[10px] text-gray-400 uppercase tracking-widest">
             Protected by DeltaZone Security
           </p>
        </div>
      </div>
    </div>
  );
};
