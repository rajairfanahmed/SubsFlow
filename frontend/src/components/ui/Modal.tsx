"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    // Lock body scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm transition-opacity"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ 
                  scale: 1, 
                  opacity: 1, 
                  y: 0,
                  transition: { type: "spring", stiffness: 300, damping: 25 }
              }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className={cn(
                "w-full max-w-lg bg-white rounded-[32px] shadow-prism border border-white/50 p-6 pointer-events-auto relative",
                className
              )}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    {title && <h2 className="text-xl font-serif font-semibold text-slate-900">{title}</h2>}
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-50 transition-colors absolute top-4 right-4"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="overflow-y-auto max-h-[80vh]">
                     {children}
                </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
