"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Sparkles, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 text-center"
      >
        <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl text-indigo-600">
            <Mail size={32} />
        </div>
        <h1 className="text-4xl font-serif italic text-slate-900">
          Check your email
        </h1>
        <p className="text-slate-500 font-sans font-medium">
          We sent a verification confirmation code to <span className="text-slate-900">name@example.com</span>
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
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    className="pl-5 text-center tracking-widest text-lg"
                    maxLength={6}
                />
            </div>
        </div>

        <button className="mt-4 w-full h-12 bg-slate-900 text-white rounded-full font-medium shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group">
             Verify Email
             <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        <p className="text-center text-sm text-slate-500 mt-6">
            Didn't receive the email?{" "}
            <button className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                Click to resend
            </button>
        </p>
        
        <div className="text-center mt-4">
             <Link href="/login" className="text-sm font-medium text-slate-900 hover:underline decoration-slate-900/30">
                Back to login
            </Link>
        </div>
      </motion.form>
    </div>
  );
}
