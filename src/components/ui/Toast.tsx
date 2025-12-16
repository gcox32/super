'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

export type ToastOptions = {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastInternal = ToastOptions & {
  id: string;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function getIconForVariant(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'error':
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    case 'info':
    default:
      return <Loader2 className="w-4 h-4 text-zinc-400" />;
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast: ToastInternal = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? 'info',
        duration: options.duration ?? 3000,
      };

      setToasts((current) => [...current, toast]);

      if (toast.duration && toast.duration > 0) {
        window.setTimeout(() => {
          dismissToast(id);
        }, toast.duration);
      }
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="top-4 z-60 fixed inset-x-0 flex justify-center px-4 pointer-events-none">
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {toasts.map((toast) => (
                <button
                  key={toast.id}
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="flex items-start gap-3 bg-zinc-900/95 shadow-black/50 shadow-lg backdrop-blur-md px-4 py-3 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl text-zinc-50 text-sm text-left active:scale-[0.99] transition pointer-events-auto"
                >
                  <div className="mt-0.5 shrink-0">
                    {getIconForVariant(toast.variant ?? 'info')}
                  </div>
                  <div className="flex-1">
                    {toast.title && (
                      <div className="font-medium leading-snug">
                        {toast.title}
                      </div>
                    )}
                    {toast.description && (
                      <div className="mt-0.5 text-zinc-400 text-xs leading-snug">
                        {toast.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}


