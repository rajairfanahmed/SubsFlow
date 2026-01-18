"use client";

import { motion } from "framer-motion";
import { Check, CreditCard, Zap } from "lucide-react";

export default function SubscriptionPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif italic text-slate-900">Subscription & Billing</h1>
        <p className="text-slate-500 font-sans font-medium mt-1">Manage your plan and payment details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
         {/* Current Plan Card */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm"
         >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Current Plan</span>
                    <h2 className="text-2xl font-serif text-slate-900 mt-1">Free Tier</h2>
                </div>
                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                    <Zap size={20} />
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-slate-600">
                    <Check size={18} className="text-emerald-500" />
                    <span className="text-sm font-medium">Access to 5 free courses</span>
                </div>
                 <div className="flex items-center gap-3 text-slate-600">
                    <Check size={18} className="text-emerald-500" />
                    <span className="text-sm font-medium">Standard community support</span>
                </div>
                 <div className="flex items-center gap-3 text-slate-400">
                    <Check size={18} />
                    <span className="text-sm line-through">Access to premium workshops</span>
                </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div>
                    <p className="text-indigo-900 font-bold text-sm">Upgrade to Pro</p>
                    <p className="text-indigo-600 text-xs">Unlock everything for $29/mo</p>
                </div>
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                    Upgrade Now
                </button>
            </div>
         </motion.div>

         {/* Payment Method */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm"
         >
             <h3 className="text-lg font-serif text-slate-900 mb-6">Payment Method</h3>
             
             <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white flex flex-col justify-between shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex justify-between items-start">
                    <CreditCard size={24} className="text-slate-400" />
                    <span className="font-serif italic text-white/50">Prism</span>
                </div>
                <div>
                    <p className="font-mono text-lg tracking-widest mb-1">•••• 4242</p>
                    <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider">
                        <span>Expiry 12/28</span>
                        <span>CVC •••</span>
                    </div>
                </div>
             </div>

             <button className="w-full py-3 border border-slate-200 rounded-full text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
                Update Payment
             </button>
         </motion.div>
      </div>
    </div>
  );
}
