"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center">
            <input
                type="radio"
                id={inputId}
                className={cn(
                    "peer h-5 w-5 appearance-none rounded-full border border-slate-200 bg-white transition-all checked:border-indigo-600 checked:bg-indigo-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
            <div className="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
        </div>
        {label && (
            <label htmlFor={inputId} className="text-sm font-medium text-slate-900 cursor-pointer select-none">
                {label}
            </label>
        )}
      </div>
    )
  }
)
Radio.displayName = "Radio"

export { Radio }
