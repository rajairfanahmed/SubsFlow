"use client";

import { motion } from "framer-motion";
import { ArrowRight, LineChart } from "lucide-react";

export function Features() {
  return (
    <section className="w-full max-w-7xl mx-auto mb-24 px-4">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 px-4">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm border border-indigo-200/50 shadow-sm font-sans font-medium">
              01
            </span>
            <span className="h-px w-20 bg-gradient-to-r to-transparent from-indigo-200"></span>
          </motion.div>
          <div className="relative">
            <span className="absolute -top-12 -left-8 text-[10rem] leading-none font-serif text-slate-900 opacity-[0.03] select-none pointer-events-none">
              01
            </span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-[2.75rem] text-slate-900 mb-5 font-serif relative z-10"
            >
              Precision at every scale
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 leading-relaxed font-sans font-medium"
          >
            Connect every part of your engineering workflow in one unified
            interface. Track progress, catch regressions, and ship faster with
            confidence.
          </motion.p>
        </div>
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="whitespace-nowrap flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm text-slate-700 hover:bg-gray-50 hover:text-slate-900 transition-all shadow-sm group font-sans font-medium"
        >
          Explore all features
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </motion.button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Feature 1: Auth */}
        <motion.div 
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
        >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="font-serif text-xl text-slate-900 mb-2">Secure Authentication</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Enterprise-grade security with JWT, role-based access control, and encrypted sessions.</p>
        </motion.div>

        {/* Feature 2: Payments */}
        <motion.div 
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
        >
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
            <h3 className="font-serif text-xl text-slate-900 mb-2">Stripe Payments</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Seamless recurring billing, one-time payments, and automated invoice management.</p>
        </motion.div>

        {/* Feature 3: Tiered Access */}
        <motion.div 
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
        >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h3 className="font-serif text-xl text-slate-900 mb-2">Tier-Based Access</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Granular content gating based on subscription tiers. Control exactly who sees what.</p>
        </motion.div>

        {/* Feature 4: Analytics */}
        <motion.div 
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
        >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <LineChart size={24} />
            </div>
            <h3 className="font-serif text-xl text-slate-900 mb-2">Real-time Analytics</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Deep insights into revenue, churn, and engagement to optimize your growth strategy.</p>
        </motion.div>

      </div>
    </section>
  );
}
