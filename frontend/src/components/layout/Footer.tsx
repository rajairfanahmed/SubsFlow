"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Twitter, Github, Linkedin, ArrowRight, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const FOOTER_LINKS = {
    Product: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "API", href: "#" },
        { label: "Changelog", href: "#" },
        { label: "Docs", href: "#" },
    ],
    Company: [
        { label: "About", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Contact", href: "#" },
    ],
    Legal: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Security", href: "#" },
        { label: "Cookies", href: "#" },
    ]
};

const SOCIALS = [
    { icon: Twitter, href: "#" },
    { icon: Github, href: "#" },
    { icon: Linkedin, href: "#" }
];

export function Footer() {
  return (
    <footer className="bg-slate-50 pt-24 pb-12 border-t border-slate-200 relative z-10 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
            {/* Brand Column (Wide - Spans 4 cols) */}
            <div className="lg:col-span-4">
                <Link href="/" className="inline-block group mb-6">
                    <Logo />
                </Link>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-sm">
                    The complete platform for creators to monetize content. Built for scale, security, and speed.
                </p>

                {/* Newsletter Input */}
                <div className="max-w-xs">
                    <h5 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Subscribe to newsletter</h5>
                    <div className="relative">
                        <input 
                            type="email" 
                            placeholder="Enter email" 
                            className="w-full h-10 pl-4 pr-10 bg-white border border-slate-200 rounded-full text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                        />
                        <button className="absolute right-1 top-1 bottom-1 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white transition-colors">
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Links Columns (Span 2 each) */}
            <div className="lg:col-span-2">
                <h4 className="font-bold text-slate-900 mb-6">Product</h4>
                <ul className="space-y-3">
                    {FOOTER_LINKS.Product.map((link) => (
                        <li key={link.label}>
                            <FooterLink href={link.href}>{link.label}</FooterLink>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="lg:col-span-2">
                <h4 className="font-bold text-slate-900 mb-6">Company</h4>
                <ul className="space-y-3">
                    {FOOTER_LINKS.Company.map((link) => (
                        <li key={link.label}>
                            <FooterLink href={link.href}>{link.label}</FooterLink>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="lg:col-span-2">
                <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
                <ul className="space-y-3">
                    {FOOTER_LINKS.Legal.map((link) => (
                        <li key={link.label}>
                            <FooterLink href={link.href}>{link.label}</FooterLink>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Socials Column (Span 2) */}
            <div className="lg:col-span-2">
                <h4 className="font-bold text-slate-900 mb-6">Socials</h4>
                <div className="flex gap-4">
                    {SOCIALS.map(({ icon: Icon, href }, i) => (
                        <a 
                            key={i} 
                            href={href} 
                            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:scale-110 transition-all duration-300 shadow-sm"
                        >
                            <Icon size={18} />
                        </a>
                    ))}
                </div>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm font-medium">
                © {new Date().getFullYear()} SubsFlow Inc. All rights reserved.
            </p>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span className="text-xs font-semibold text-emerald-700">All systems operational</span>
            </div>
        </div>

      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href}>
            <motion.div
                className="text-slate-500 text-[15px] inline-block font-medium"
                whileHover={{ x: 4, color: "#4f46e5" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {children}
            </motion.div>
        </Link>
    )
}
