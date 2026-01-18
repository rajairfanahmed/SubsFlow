"use client";

import { motion } from "framer-motion";
import { Lock, Play, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const CONTENT_ITEMS = [
  { id: 1, title: "Advanced React", duration: "4h 20m", rating: 4.9, image: "bg-indigo-100", locked: false },
  { id: 2, title: "System Design", duration: "6h 15m", rating: 4.8, image: "bg-emerald-100", locked: false },
  { id: 3, title: "Microservices", duration: "8h 00m", rating: 4.9, image: "bg-amber-100", locked: true }, // Locked
  { id: 4, title: "Docker Mastery", duration: "3h 45m", rating: 4.7, image: "bg-sky-100", locked: true }, // Locked
  { id: 5, title: "Kubernetes", duration: "10h 30m", rating: 5.0, image: "bg-rose-100", locked: true }, // Locked
  { id: 6, title: "GraphQL API", duration: "5h 10m", rating: 4.8, image: "bg-fuchsia-100", locked: false },
];

export default function MyListPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif italic text-slate-900">Content Library</h1>
        <p className="text-slate-500 font-sans font-medium mt-1">Explore our premium courses and workshops.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {CONTENT_ITEMS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1 hover:rotate-1"
            style={{ perspective: "1000px" }}
          >
            {/* Thumbnail */}
            <div className={cn("h-48 rounded-t-[24px] relative overflow-hidden", item.image)}>
                {/* Lock Overlay */}
                {item.locked && (
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-md z-20 flex flex-col items-center justify-center text-white/90">
                        <div className="w-12 h-12 rounded-full bg-slate-900/80 flex items-center justify-center mb-2 shadow-lg">
                            <Lock size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Premium Only</span>
                    </div>
                )}
                
                {/* Play Button Overlay (On Hover if unlocked) */}
                {!item.locked && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="w-14 h-14 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                            <Play size={24} fill="currentColor" className="ml-1" />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-3 text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {item.duration}
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} fill="currentColor" />
                        {item.rating}
                    </div>
                </div>
                <h3 className="text-xl font-serif text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {item.title}
                </h3>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
