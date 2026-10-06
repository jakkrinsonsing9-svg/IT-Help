import React from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md transition-all transform animate-in slide-in-from-bottom-5 duration-200 border ${
            toast.type === 'error'
              ? 'bg-[#1e1b1b] text-white border-red-500/40'
              : toast.type === 'info'
              ? 'bg-[#182635] text-white border-blue-500/40'
              : 'bg-[#0f1d2e] text-white border-emerald-500/40'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] shrink-0 ${
              toast.type === 'error'
                ? 'text-red-400'
                : toast.type === 'info'
                ? 'text-blue-400'
                : 'text-emerald-400'
            }`}
          >
            {toast.type === 'error'
              ? 'error'
              : toast.type === 'info'
              ? 'info'
              : 'check_circle'}
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="font-headline font-bold text-sm tracking-tight text-white leading-tight">
              {toast.title}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
