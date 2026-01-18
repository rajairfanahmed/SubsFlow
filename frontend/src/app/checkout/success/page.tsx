"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, Download } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/Button"; // Or reuse generic button styling

export default function CheckoutSuccessPage() {
  useEffect(() => {
    // Trigger confetti on load
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-md bg-white rounded-[40px] shadow-prism border border-white/50 overflow-hidden relative"
      >
        {/* Top Section */}
        <div className="p-10 flex flex-col items-center text-center pb-12 relative z-10 bg-white">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-emerald-500 shadow-inner"
            >
                <Check size={40} strokeWidth={3} />
            </motion.div>
            
            <h1 className="text-3xl font-serif italic text-slate-900 mb-2">Payment Successful!</h1>
            <p className="text-slate-500 font-medium">Thank you for your purchase.</p>
        </div>

        {/* Receipt Section (Torn Paper Effect) */}
        <div className="relative bg-slate-50 px-10 py-8 border-t border-dashed border-slate-200">
             {/* Torn Paper Decor */}
             <div className="absolute top-[-6px] left-0 w-full h-3 bg-white" style={{ clipPath: "polygon(0 50%, 5% 0, 10% 50%, 15% 0, 20% 50%, 25% 0, 30% 50%, 35% 0, 40% 50%, 45% 0, 50% 50%, 55% 0, 60% 50%, 65% 0, 70% 50%, 75% 0, 80% 50%, 85% 0, 90% 50%, 95% 0, 100% 50%)" }}></div>

             <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Amount paid</span>
                    <span className="text-slate-900 font-bold">$29.00</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Date</span>
                    <span className="text-slate-900 font-bold">Oct 24, 2025</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Payment method</span>
                    <span className="text-slate-900 font-bold">Visa •••• 4242</span>
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="w-full text-base font-bold shadow-lg shadow-slate-900/10">
                    <Link href="/dashboard">
                        Go to Dashboard
                        <ArrowRight size={16} className="ml-2" />
                    </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full text-base font-bold">
                    <Download size={16} className="mr-2" />
                    Download Receipt
                </Button>
             </div>
        </div>
      </motion.div>
    </div>
  );
}
