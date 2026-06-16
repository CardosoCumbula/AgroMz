import React, { createContext, useContext, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  toast: { message: string; type: ToastType } | null;
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: null,
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
      {/* FIXED TOAST NOTIFICATION UI */}
      {toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-2.5 border text-sm font-semibold transition animate-fade-in-up ${
          toast.type === "success" ? "bg-green-600 text-white border-green-500" :
          toast.type === "error" ? "bg-red-600 text-white border-red-500" :
          "bg-stone-900 text-white border-stone-800"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
};
