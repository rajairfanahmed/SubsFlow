"use client";

import { Lock, Play, Clock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock Data
const CONTENT = [
    { id: 1, title: "Getting Started with React 19", author: "Sarah J", duration: "12m", premium: false, thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60" },
    { id: 2, title: "Advanced State Management", author: "Mike T", duration: "45m", premium: true, thumbnail: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&auto=format&fit=crop&q=60" },
    { id: 3, title: "Server Components Deep Dive", author: "Sarah J", duration: "32m", premium: true, thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop&q=60" },
    { id: 4, title: "UI Design Patterns for 2026", author: "Alex D", duration: "28m", premium: false, thumbnail: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=60" },
    { id: 5, title: "Database Scaling Strategies", author: "Mike T", duration: "55m", premium: true, thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60" },
    { id: 6, title: "Building Mobile Apps with RN", author: "Sarah J", duration: "1h 12m", premium: true, thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=60" },
];

export default function LibraryPage() {
  return (
    <div>
        <header className="mb-10">
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Content Library</h1>
            <p className="text-slate-500">Explore our latest courses and workshops.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CONTENT.map((item, index) => (
                <ContentCard key={item.id} item={item} index={index} />
            ))}
        </div>
    </div>
  );
}

function ContentCard({ item, index }: { item: any, index: number }) {
    // Determine if locked (Mock logic: All premium items are locked for this demo)
    const isLocked = item.premium;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
        >
            <Link href={isLocked ? "#upgrade" : `/dashboard/watch/${item.id}`}>
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <Image 
                        src={item.thumbnail} 
                        alt={item.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs font-medium text-white flex items-center gap-1">
                        <Clock size={10} />
                        {item.duration}
                    </div>

                    {/* Locked Overlay */}
                    {isLocked && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-white p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                                <Lock size={20} />
                            </div>
                            <p className="font-medium text-sm">Upgrade to View</p>
                        </div>
                    )}

                    {/* Play Overlay (Only if NOT locked) */}
                    {!isLocked && (
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                 <Play size={20} className="text-slate-900 ml-1" fill="currentColor" />
                             </div>
                         </div>
                    )}
                </div>

                {/* Meta Data */}
                <div className="p-5">
                    <h3 className="font-serif font-bold text-lg text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                        {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <User size={14} />
                        <span>{item.author}</span>
                        {item.premium && (
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wide border border-indigo-100">
                                Premium
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
