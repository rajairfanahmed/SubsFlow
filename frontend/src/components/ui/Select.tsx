"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
  }

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="w-full relative">
        <div className="relative">
            <select
            className={cn(
                "flex h-12 w-full appearance-none rounded-full border border-slate-200 bg-white px-4 py-2 pr-10 text-sm font-medium text-slate-900 shadow-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                error && "border-red-500 focus-visible:ring-red-500",
                className
            )}
            ref={ref}
            {...props}
            >
            {children}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
        <AnimatePresence>
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="text-xs text-red-500 mt-1 pl-4 font-medium"
                >
                    {error}
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
