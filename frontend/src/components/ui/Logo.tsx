import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false, textClassName }: LogoProps & { textClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      {/* The Infinite Flow Icon */}
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-indigo-600"
        >
          <path
            d="M8.5 22C6.567 22 5 20.433 5 18.5C5 16.567 6.567 15 8.5 15C10.433 15 12 16.567 12 18.5C12 20.433 10.433 22 8.5 22Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M23.5 17C21.567 17 20 15.433 20 13.5C20 11.567 21.567 10 23.5 10C25.433 10 27 11.567 27 13.5C27 15.433 25.433 17 23.5 17Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M8.5 15C9.5 13 12 10 16 10C20 10 20 17 23.5 17"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M23.5 10C22.5 12 20 15 16 15C12 15 12 22 8.5 22"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        {/* Growth Dot */}
        <div className="absolute top-1 right-0.5 w-1.5 h-1.5 bg-teal-400 rounded-full shadow-sm" />
      </div>

      {!iconOnly && (
        <span className={cn("font-serif font-bold italic text-xl text-slate-900 tracking-tight", textClassName)}>
          SubsFlow
        </span>
      )}
    </div>
  );
}
