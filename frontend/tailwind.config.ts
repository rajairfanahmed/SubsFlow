import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "serif"],
      },
      colors: {
        background: "#F8F9FB", // Off-white surface
        surface: "#FFFFFF",     // Card background
        primary: "#0F172A",     // Slate-900
        secondary: "#64748B",   // Slate-500
        border: "#F1F5F9",      // Slate-100
        accent: "#4F46E5",      // Indigo-600
        slate: {
            50: "#f8fafc",
            100: "#f1f5f9",
            200: "#e2e8f0",
            300: "#cbd5e1",
            400: "#94a3b8",
            500: "#64748b",
            600: "#475569",
            700: "#334155",
            800: "#1e293b",
            900: "#0f172a",
        },
        indigo: {
            50: "#eef2ff",
            100: "#e0e7ff",
            200: "#c7d2fe",
            300: "#a5b4fc",
            400: "#818cf8",
            500: "#6366f1",
            600: "#4f46e5", // Accent
            700: "#4338ca",
            800: "#3730a3",
            900: "#312e81",
        }
      },
      borderRadius: {
        card: "24px", // 3xl
        pill: "9999px", // Full
        DEFAULT: "0.75rem",
      },
      boxShadow: {
        "prism": "0px 1px 1px 0px rgba(255, 255, 255, 0.1) inset, 0px 50px 100px -20px rgba(50, 50, 93, 0.25), 0px 30px 60px -30px rgba(0, 0, 0, 0.3)",
        "glass": "0 4px 30px rgba(0, 0, 0, 0.1)",
        "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      keyframes: {
        "scroll-enter": {
          "0%": { opacity: "0", transform: "translateY(24px) scale(0.98)", filter: "blur(4px)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)", filter: "blur(0)" },
        },
        "blob-float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
         "fade-in-up": {
            "0%": { opacity: "0", transform: "translateY(20px)" },
            "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "scroll-enter": "scroll-enter 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "blob-float": "blob-float 20s infinite ease-in-out",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
