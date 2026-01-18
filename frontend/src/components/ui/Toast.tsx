"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Simple Toast Context for the application
type ToastType = {
  id: string;
  message: string;
  type?: "default" | "success" | "error";
  duration?: number;
};

type ToastContextType = {
  toast: (message: string, options?: Partial<Omit<ToastType, "id" | "message">>) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastType[]>([]);

  const toast = React.useCallback((message: string, options: Partial<Omit<ToastType, "id" | "message">> = {}) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { id, message, ...options };
    setToasts((prev) => [...prev, newToast]);

    if (options.duration !== Infinity) {
        setTimeout(() => {
            removeToast(id);
        }, options.duration || 3000);
    }
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="pointer-events-auto bg-slate-900 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-3 min-w-[300px] justify-between"
            >
              <span className="text-sm font-medium font-sans">{t.message}</span>
              <button 
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
