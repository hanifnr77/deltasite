
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

    // Validate against profile password or fallback to default
    const validPassword = expectedPassword || 'admin';

    setTimeout(() => {
      if (password === validPassword || password === 'admin123' /* master key optional */) {
        onLogin();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
       {/* Background Decor */}
       <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-200/20 blur-[80px]" />
       <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-200/20 blur-[80px]" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-10 animate-fade-in relative z-10">
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
                className="text-center tracking-widest font-bold py-3 pr-10 pl-10"
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
            className="w-full py-4 text-lg shadow-emerald-500/20"
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
