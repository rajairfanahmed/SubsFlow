"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion, HTMLMotionProps } from "framer-motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:pointer-events-none disabled:opacity-50 will-change-transform active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[#0F172A] text-white hover:bg-slate-800 shadow-lg shadow-indigo-500/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)] border border-slate-800",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-red-500/20",
        outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-slate-900 underline-offset-4 hover:underline",
        prism: "bg-white border border-slate-200 text-slate-900 shadow-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-full px-3",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
    // If we use motion.button, we get the animations for free without complex CSS
    // However, if asChild is true, we can't easily wrap it. 
    // For this specific 'Prism' polish, explicit motion component is best for "Apple-like" feel.
    // But to satisfy "asChild" prop pattern compatibility, we might need a wrapper or just use CSS classes.
    // The user requirement explicitly asked for "Hover: Scale 1.02 + Shadow Bloom, Click: Scale 0.95".
    // We can achieve this with CSS active/hover states or motion.

    // Let's use CSS for better hydration compatibility if we want to avoid 'use client' issues deeper down, 
    // but this file is already 'use client'.
    
    // We'll stick to standard button with framer-motion tap/hover props if not asChild.
    
    if (asChild) {
      const Comp = "div"; // Fallback if slot not imported, but we'll assume it handles itself.
      // Actually standard shadcn/radix Slot doesn't support motion props easily.
      // We will just apply the classes.
      return (
         // @ts-ignore
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isLoading || props.disabled}
        ref={ref as any}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...(props as any)}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

import { Slot } from "@radix-ui/react-slot";

// Re-export variants
export { Button, buttonVariants };
