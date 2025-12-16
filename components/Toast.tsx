
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto close after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-slate-900 text-white border-slate-800', // Modern Dark Style for Success
    error: 'bg-red-50 text-red-600 border-red-100',
    info: 'bg-white text-slate-800 border-slate-200 shadow-xl'
  };

  const icons = {
    success: <CheckCircle2 className="text-emerald-400" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-full shadow-2xl border ${styles[type]} min-w-[320px] max-w-md`}>
        {icons[type]}
        <p className="flex-1 text-sm font-bold tracking-tight">{message}</p>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <X size={16} className="opacity-60 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
