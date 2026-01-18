import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-slate-50 hover:bg-slate-900/80",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        destructive:
          "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100/80",
        outline: "text-slate-950 border border-slate-200",
        active: "bg-emerald-50 text-emerald-600 border border-emerald-100", // Prism specific active state
        warning: "bg-amber-50 text-amber-600 border border-amber-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
