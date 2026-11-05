'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastState extends ToastProps {
  id: string;
}

interface ToastContextValue {
  toasts: ToastState[];
  addToast: (toast: ToastProps) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Holds every toast in one place and renders a single container for the whole app.
 * Wrap the app with this in app/layout.tsx so toasts from any page are visible.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: ToastProps) => {
      const id = Math.random().toString(36).slice(2, 11);
      setToasts((prev) => [...prev, { ...toast, id }]);

      // Auto-remove after duration
      const duration = toast.duration || 3000;
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastContainerProps {
  toasts: ToastState[];
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  const getIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  const getColor = (type?: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'error':
        return 'bg-red-500/20 border-red-500/30 text-red-300';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      default:
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] space-y-2 max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`backdrop-blur-xl rounded-lg border px-4 py-3 flex items-start gap-3 shadow-lg pointer-events-auto cursor-pointer ${getColor(toast.type)}`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="flex-shrink-0 font-bold text-lg">{getIcon(toast.type)}</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export { useToast };
