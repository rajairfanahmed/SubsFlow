"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif italic text-slate-900">Good morning, Jane</h1>
        <p className="text-slate-500 font-sans font-medium mt-1">Here's what's happening with your learning journey.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: "Courses Completed", value: "12", sub: "+2 this month" },
            { label: "Hours Watched", value: "48", sub: "Top 5% of learners" },
            { label: "Certificates", value: "05", sub: "View all" },
        ].map((stat, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[32px] p-8 border border-white/50 shadow-sm hover:shadow-prism transition-shadow"
            >
                <div className="text-5xl font-serif text-slate-900 mb-2">{stat.value}</div>
                <div className="text-sm font-sans font-bold uppercase tracking-wider text-slate-500 mb-1">{stat.label}</div>
                <div className="text-xs font-sans font-medium text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded-full">{stat.sub}</div>
            </motion.div>
        ))}
      </div>

      {/* Continue Watching (Bento Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-white/50 shadow-sm relative overflow-hidden group"
        >
            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-xl font-serif text-slate-900">Continue Watching</h3>
                <button className="text-sm font-medium text-indigo-600 hover:underline">View all</button>
            </div>
            
            <div className="flex gap-6 items-center relative z-10">
                <div className="w-32 h-20 bg-slate-100 rounded-xl flex-shrink-0 relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-indigo-500/10"></div>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-lg">Advanced React Patterns</h4>
                    <p className="text-slate-500 text-sm mb-3">Lesson 5: Compound Components</p>
                    <div className="h-2 w-48 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 w-[65%] rounded-full"></div>
                    </div>
                </div>
                <button className="ml-auto w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                </button>
            </div>

            {/* Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-0 opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
        </motion.div>

        {/* Recommended (Bento Card - Vertical) */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0F172A] rounded-[32px] p-8 text-white relative overflow-hidden"
        >
             <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-indigo-500 rounded-full blur-[50px] animate-blob-float"></div>

             <h3 className="text-xl font-serif mb-4 relative z-10">New Arrival</h3>
             <p className="text-slate-400 text-sm mb-6 relative z-10 font-sans font-medium">Master the new Next.js 14 App Router features.</p>
             
             <div className="relative aspect-video bg-white/10 rounded-2xl border border-white/10 mb-4 backdrop-blur-sm flex items-center justify-center">
                <span className="font-serif italic text-2xl">Next.js 14</span>
             </div>
             
             <button className="w-full py-3 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-indigo-50 transition-colors">
                Start Learning
             </button>
        </motion.div>
      </div>
    </div>
  );
}
