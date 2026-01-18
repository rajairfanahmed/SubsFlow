"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    number: "01",
    title: "Sign Up",
    description: "Create your creator account in seconds. No credit card required.",
  },
  {
    number: "02",
    title: "Choose Plan",
    description: "Start free or select a tier that matches your goals.",
  },
  {
    number: "03",
    title: "Access Content",
    description: "Dive into analytics, roadmap tools, and feature controls.",
  },
  {
    number: "04",
    title: "Manage Billing",
    description: "Handle subscriptions and payouts effortlessly.",
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 80%"],
  });

  return (
    <section className="py-24 px-3 md:py-32 md:px-6 bg-white relative z-10 overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 relative">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] leading-none font-serif text-slate-900 opacity-[0.03] select-none pointer-events-none z-0">
            02
          </span>
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3 relative z-10">Process</h2>
          <h3 className="text-4xl md:text-5xl font-serif font-medium text-text-primary tracking-tightest relative z-10">
            How it works
          </h3>
        </div>

        <div className="relative">
            {/* Desktop Timeline - Horizontal */}
            <div className="hidden md:block absolute top-[40px] left-0 right-0 h-[2px] bg-slate-100">
                <motion.div 
                    style={{ scaleX: scrollYProgress }}
                    className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 origin-left"
                />
            </div>

            {/* Mobile Timeline - Vertical */}
            <div className="md:hidden absolute top-0 bottom-0 left-[27px] w-[2px] border-l-2 border-dashed border-slate-200"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4 relative z-10">
                {STEPS.map((step, index) => (
                    <StepItem key={step.number} step={step} index={index} />
                ))}
            </div>
        </div>

      </div>
    </section>
  );
}

function StepItem({ step, index }: { step: any, index: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            className="flex md:flex-col gap-8 md:gap-0 pl-4 md:pl-0 md:items-center text-left md:text-center relative group"
        >
            {/* Number Circle Node */}
            <div className={`
                w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-full flex items-center justify-center 
                bg-white border-4 border-slate-100 relative z-10
                md:mb-8 group-hover:border-indigo-100 transition-colors duration-500
                shadow-sm group-hover:shadow-[0_0_0_8px_rgba(99,102,241,0.1)]
            `}>
                <span className="font-serif font-bold text-xl md:text-3xl text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {step.number}
                </span>

                {/* Vertical Connector Line to Card (Desktop) */}
                <div className="hidden md:block absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-8 bg-slate-200 group-hover:bg-indigo-200 transition-colors" />
            </div>

            {/* Card Content */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative group-hover:-translate-y-1 transition-transform duration-300 w-full">
                 {/* Little Triangle Connector */}
                 <div className="hidden md:block absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t border-l border-slate-100 rotate-45" />

                <h4 className="text-xl font-bold font-serif text-text-primary mb-2 group-hover:text-indigo-600 transition-colors">
                    {step.title}
                </h4>
                <p className="text-text-secondary text-sm leading-relaxed break-words hyphens-auto">
                    {step.description}
                </p>
            </div>
        </motion.div>
    )
}
