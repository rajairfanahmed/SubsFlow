"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  // const { scrollY } = useScroll()
  // const opacity = useTransform(scrollY, [0, 400], [1, 0])
  // const translateY = useTransform(scrollY, [0, 400], [0, 100])

  return (
    <section className="relative w-full min-h-[120vh] bg-[#F8F9FB] overflow-hidden pt-32 pb-40">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-3xl animate-blob-float" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl animate-blob-float [animation-delay:2s]" />
        <div className="absolute bottom-[20%] left-[20%] w-[400px] h-[400px] bg-teal-200/40 rounded-full blur-3xl animate-blob-float [animation-delay:4s]" />
      </div>

      <motion.div 
        className="container mx-auto px-4 md:px-6 relative z-10 text-center"
      >
        {/* Announcement Pill */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center mb-8"
        >
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-default">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span className="text-sm font-medium text-slate-600 tracking-wide uppercase text-[11px]">
                    v2.0 is now live
                </span>
             </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="text-[clamp(2.5rem,8vw,5rem)] md:text-8xl font-serif text-slate-900 tracking-tight leading-[0.9] text-center mb-8 max-w-5xl mx-auto"
        >
            Monetize content with <span className="italic text-indigo-600">precision</span>.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-sans font-normal mb-10 leading-relaxed"
        >
            The production-grade platform for Creators, Educators, and Publishers. 
            Manage subscriptions, gate content, and scale revenue.
        </motion.p>

        {/* CTAs */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
        >
            <Link 
                href="/register" 
                className="h-12 px-8 rounded-full bg-slate-900 text-white font-medium flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:scale-105 hover:shadow-xl transition-all duration-300"
            >
                Start Free Trial
                <ArrowRight size={18} />
            </Link>
             <Link 
                href="#pricing" 
                className="h-12 px-8 rounded-full bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors"
            >
                View Pricing
            </Link>
        </motion.div>

        {/* 3D Dashboard Mockup */}
        <div className="perspective-1000 w-full max-w-6xl mx-auto">
            <motion.div
                initial={{ rotateX: 12, opacity: 0, y: 50 }}
                animate={{ rotateX: 12, opacity: 1, y: 0 }}
                whileHover={{ rotateX: 0, scale: 1.02 }}
                transition={{ 
                    duration: 0.8, 
                    type: "spring", 
                    stiffness: 100, 
                    damping: 20 
                }}
                className="w-full relative rounded-xl bg-white aspect-[16/9] shadow-prism border-[6px] border-white/50 overflow-hidden group cursor-pointer"
            >
                {/* Mockup Topbar */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2 z-10">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
                    </div>
                </div>

                {/* Dashboard Image Placeholder - In real app use next/image with a screenshot */}
                {/* CSS-Only Dashboard Mockup */}
                <div className="absolute inset-0 bg-slate-50 flex overflow-hidden rounded-b-xl pt-10">
                    {/* Sidebar */}
                    <div className="w-[18%] lg:w-64 bg-slate-50 border-r border-slate-200/60 p-4 hidden md:flex flex-col gap-4 z-10">
                         <div className="flex items-center gap-3 mb-4 px-2">
                             <div className="h-6 w-6 bg-indigo-600 rounded-md shadow-sm shrink-0"></div>
                             <div className="h-3 w-20 bg-slate-200 rounded-full"></div>
                         </div>
                         <div className="space-y-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className={`h-8 w-full rounded-lg flex items-center px-3 ${i === 1 ? 'bg-white border border-slate-200 shadow-sm' : 'hover:bg-slate-100'}`}>
                                    <div className={`h-2 w-2 rounded-full mr-3 ${i === 1 ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                                    <div className={`h-2 w-16 rounded-full ${i === 1 ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                                </div>
                            ))}
                         </div>
                         <div className="mt-auto">
                            <div className="h-12 w-full bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100"></div>
                                <div className="space-y-1.5">
                                    <div className="h-2 w-20 bg-slate-200 rounded-full"></div>
                                    <div className="h-1.5 w-12 bg-slate-100 rounded-full"></div>
                                </div>
                            </div>
                         </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] relative">
                        {/* Header */}
                        <div className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between px-6">
                            <div className="flex items-center gap-4">
                                <div className="h-4 w-32 bg-slate-100 rounded-full"></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-24 bg-slate-100 rounded-full hidden sm:block"></div>
                                <div className="h-8 w-8 bg-indigo-50 rounded-full border border-indigo-100"></div>
                            </div>
                        </div>
                        
                        {/* Scrollable Area */}
                        <div className="p-6 space-y-6 overflow-hidden">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 lg:gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 lg:p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100"></div>
                                            <div className={`h-4 w-12 rounded-full ${i === 3 ? 'bg-red-50 text-red-600' : 'bg-emerald-50'}`}></div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-6 w-24 bg-slate-100 rounded-lg"></div>
                                            <div className="h-3 w-16 bg-slate-50 rounded-lg"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Main Chart Card */}
                            <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-slate-100 rounded-full"></div>
                                        <div className="h-3 w-48 bg-slate-50 rounded-full"></div>
                                    </div>
                                    <div className="h-8 w-24 bg-slate-50 rounded-lg border border-slate-100"></div>
                                </div>
                                
                                <div className="h-32 lg:h-48 flex items-end justify-between gap-2 px-2 pb-2">
                                     {[35, 55, 45, 70, 60, 75, 50, 90, 80, 65, 85, 95].map((h, i) => (
                                       <div key={i} className="relative w-full h-full group flex items-end">
                                            <div 
                                                className="w-full bg-indigo-50 rounded-t-sm group-hover:bg-indigo-100 transition-colors duration-300 relative overflow-hidden" 
                                                style={{ height: `${h}%` }}
                                            >
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500/20"></div>
                                            </div>
                                            {/* Tooltip hint defined in standard CSS if needed, but skipped for pure CSS perf */}
                                       </div>
                                   ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Glow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"></div>
            </motion.div>
        </div>

      </motion.div>
    </section>
  )
}
