"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { name: "Features", href: "#" },
    { name: "Methodology", href: "#" },
    { name: "Pricing", href: "#" },
    { name: "Blog", href: "#" },
  ];

  return (
    <>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
          className="flex transition-all duration-300 hover:shadow-[0_4px_25px_rgba(0,0,0,0.06)] bg-white border-white/50 border rounded-full pt-2 pr-2 pb-2 pl-2 shadow-[0_2px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl items-center justify-between"
        >
          {/* Logo Area */}
          <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 h-[50px] bg-slate-50/50 rounded-full hover:bg-slate-100 transition-colors">
               <Logo />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                  <Link 
                      key={link.name} 
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-sans font-medium"
                  >
                      {link.name}
                  </Link>
              ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 md:gap-4">
              <Link 
                  href="/login" 
                  className="hidden sm:block text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                  Login
              </Link>
              <Link 
                  href="/register" 
                  className="hidden sm:block hover:bg-slate-800 shadow-slate-900/20 transition-all transform hover:scale-[1.02] text-xs sm:text-sm text-white bg-[#0F172A] rounded-full py-3 px-5 sm:pt-4 sm:pr-8 sm:pb-4 sm:pl-8 shadow-lg font-sans font-medium whitespace-nowrap"
              >
                  Get Started
              </Link>
              
              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-3 rounded-full bg-slate-100 text-slate-900"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
          </div>
        </motion.div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-24 z-40 p-4 md:hidden"
          >
            <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 flex flex-col gap-4">
               {links.map((link) => (
                  <Link 
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-slate-900 py-2 border-b border-slate-50"
                  >
                    {link.name}
                  </Link>
               ))}
               <div className="grid grid-cols-2 gap-4 mt-4">
                  <Link 
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center h-12 rounded-full bg-slate-100 text-slate-900 font-medium"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center h-12 rounded-full bg-slate-900 text-white font-medium"
                  >
                    Get Started
                  </Link>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
