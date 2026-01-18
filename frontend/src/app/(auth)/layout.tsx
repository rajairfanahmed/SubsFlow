"use client";

import { motion } from "framer-motion";
import { MessageSquareQuote, Sparkles } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side (Form Area) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
           {/* Mobile Logo (Visible on small screens) */}
           <div className="lg:hidden mb-8 flex items-center gap-2">
                <Logo />
           </div>
           
           {children}
        </div>
      </div>

      {/* Right Side (Art Area - Desktop Only) */}
      <div className="hidden lg:flex w-1/2 bg-[#F8F9FB] relative overflow-hidden flex-col justify-center items-center p-12">
         {/* Floating Container */}
         <div className="relative w-full max-w-lg aspect-square">
            {/* Mesh Gradient Background inside container */}
             <div className="absolute inset-0 bg-white rounded-[40px] shadow-prism overflow-hidden border border-white/50">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-indigo-100/50 via-purple-100/50 to-pink-100/50 blur-3xl animate-blob-float"></div>
                
                {/* Content: Review Hub Style Testimonial */}
                <div className="absolute inset-0 flex items-center justify-center p-12">
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="bg-white rounded-xl border border-gray-100 p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative"
                     >
                        {/* Quote Icon */}
                        <div className="absolute -top-6 -left-6 bg-indigo-600 text-white p-3 rounded-xl shadow-lg transform rotate-[-6deg]">
                            <MessageSquareQuote size={24} />
                        </div>

                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                            <div>
                                <h4 className="text-slate-900 font-serif font-medium text-lg">Alex Chen</h4>
                                <p className="text-slate-500 text-sm font-sans font-medium">CTO, Acme Inc</p>
                            </div>
                         </div>
                         <p className="text-xl font-serif italic text-slate-800 leading-relaxed">
                            "SubsFlow isn't just a tool; it's the nervous system of our engineering team. The visibility it provides is unmatched."
                         </p>
                         
                         {/* Review Hub Signal */}
                         <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs text-slate-500 font-sans font-medium">Verified Customer</span>
                            </div>
                            <div className="flex gap-1">
                                {[1,2,3,4,5].map(i => (
                                    <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                         </div>
                     </motion.div>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
}
