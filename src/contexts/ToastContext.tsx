// Contexto global para Toast
import React, { createContext, useContext } from 'react';
import { useToast, ToastType } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => string;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();

  return (
    <ToastContext.Provider
      value={{
        showToast: toast.showToast,
        success: toast.success,
        error: toast.error,
        info: toast.info,
        warning: toast.warning,
      }}
    >
      {children}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext deve ser usado dentro de ToastProvider');
  }
  return context;
}
