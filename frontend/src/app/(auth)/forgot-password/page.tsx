"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Sparkles } from "lucide-react";

export default function ForgotPasswordPage() {
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
          Reset password
        </h1>
        <p className="text-slate-500 font-sans font-medium">
          Enter your email and we'll send you a reset link.
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
        </div>

        <button className="mt-4 w-full h-12 bg-slate-900 text-white rounded-full font-medium shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group">
             Send Reset Link
             <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        <p className="text-center text-sm text-slate-500 mt-6">
            Remember your password?{" "}
            <Link href="/login" className="font-medium text-slate-900 hover:underline decoration-slate-900/30">
                Back to login
            </Link>
        </p>
      </motion.form>
    </div>
  );
}
