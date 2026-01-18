import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular"
}

export function Skeleton({ 
  className, 
  variant = "default",
  ...props 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-100",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 rounded-md",
        variant === "default" && "rounded-xl",
        className
      )}
      {...props}
    />
  )
}
