"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { X, ArrowRight, RefreshCw } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-prism border border-white/50 overflow-hidden relative"
      >
        <div className="p-10 flex flex-col items-center text-center">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-inner"
            >
                <X size={40} strokeWidth={3} />
            </motion.div>
            
            <h1 className="text-3xl font-serif italic text-slate-900 mb-2">Payment Canceled</h1>
            <p className="text-slate-500 font-medium mb-8">
                Your payment was not processed. No charges were made to your account.
            </p>

             <div className="flex flex-col gap-3 w-full">
                <Link href="/pricing" className="w-full h-12 bg-slate-900 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                    <RefreshCw size={16} />
                    Try Again
                </Link>
                <Link href="/" className="w-full h-12 text-slate-500 font-bold text-sm bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    Return to Home
                </Link>
             </div>
        </div>
      </motion.div>
    </div>
  );
}
