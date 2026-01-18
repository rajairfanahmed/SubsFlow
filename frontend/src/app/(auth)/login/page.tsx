"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/Input"; // Using our rounded-full prism input
import { Checkbox } from "@/components/ui/Checkbox"; // Using our prism checkbox
import { Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 text-center"
      >
        <Link href="/" className="mx-auto mb-6 lg:flex hidden items-center justify-center w-12 h-12 bg-slate-900 rounded-xl text-white">
            <Sparkles size={24} />
        </Link>
        <h1 className="text-4xl font-serif italic text-slate-900">
          Welcome back
        </h1>
        <p className="text-slate-500 font-sans font-medium">
          Enter your credentials to access your account.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 mt-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="space-y-4">
            <div className="space-y-1">
                <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-5"
                />
            </div>
            <div className="space-y-1">
                <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-5"
                />
            </div>
        </div>

        <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label 
                    htmlFor="remember" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700"
                >
                    Remember me
                </label>
            </div>
            <Link 
                href="/forgot-password" 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
            >
                Forgot password?
            </Link>
        </div>

        <button className="mt-4 w-full h-12 bg-slate-900 text-white rounded-full font-medium shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group">
             Sign in
             <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

         {/* Divider */}
        <div className="flex items-center gap-4 my-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Or continue with</span>
            <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <button className="w-full h-12 bg-white border border-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
        </button>

        <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-slate-900 hover:underline decoration-slate-900/30">
                Sign up
            </Link>
        </p>
      </motion.form>
    </div>
  );
}
