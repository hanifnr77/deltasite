
import React from 'react';
import { Button } from './Button';
import { AlertTriangle, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  variant?: 'danger' | 'primary';
  confirmLabel?: string;
  isLoading?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, onConfirm, title, description, 
  variant = 'primary', confirmLabel = 'Ya, Lanjutkan', isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 animate-fade-in border border-gray-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
            <AlertTriangle size={32} />
          </div>
          
          <div>
            <h3 className="text-lg font-heading font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{description}</p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isLoading}>
              Batal
            </Button>
            <Button 
              variant={variant} 
              onClick={onConfirm} 
              className="flex-1"
              loading={isLoading}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
