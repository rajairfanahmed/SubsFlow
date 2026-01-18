"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 px-6 bg-slate-950 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-serif font-medium text-white mb-6 tracking-tightest"
        >
          Ready to monetize?
        </motion.h2>
        
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto"
        >
          Join thousands of creators who are building sustainable businesses with SubsFlow. Start your 14-day free trial today.
        </motion.p>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
        >
            <Link href="/signup">
                <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px -5px rgba(99, 102, 241, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg inline-flex items-center gap-2 hover:bg-slate-100 transition-colors"
                >
                    Get Started Now
                    <ArrowRight size={18} />
                </motion.button>
            </Link>
            <p className="mt-4 text-sm text-slate-500">No credit card required</p>
        </motion.div>
      </div>
    </section>
  );
}
