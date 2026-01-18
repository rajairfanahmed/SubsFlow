"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

// Zod Schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({ email: data.email, password: data.password, name: data.name });
      toast("Account created! Please log in.");
      // Note: AuthContext redirects to /login
    } catch (error) {
      // Error handling is managed by AuthContext usually, but visual feedback here:
      toast("Registration failed. Please try again.", { type: "error" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Shake animation variant
  const shakeVariant = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 },
    },
    noShake: { x: 0 },
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 text-center"
      >
        <Link href="/" className="mx-auto mb-6 lg:flex hidden items-center justify-center w-12 h-12 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform">
            <Sparkles size={24} />
        </Link>
        <h1 className="text-4xl font-serif italic text-slate-900">
          Create account
        </h1>
        <p className="text-slate-500 font-sans font-medium">
          Start your 14-day free trial. No credit card required.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-4 mt-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-4">
             <motion.div 
               variants={shakeVariant}
               animate={errors.name ? "shake" : "noShake"}
               className="space-y-1"
             >
                <Input 
                    type="text" 
                    placeholder="Full Name" 
                    className="pl-5"
                    error={errors.name?.message}
                    {...register("name")}
                />
            </motion.div>
            
            <motion.div 
               variants={shakeVariant}
               animate={errors.email ? "shake" : "noShake"}
               className="space-y-1"
             >
                <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-5"
                    error={errors.email?.message}
                    {...register("email")}
                />
            </motion.div>

            <motion.div 
               variants={shakeVariant}
               animate={errors.password ? "shake" : "noShake"}
               className="space-y-1"
             >
                <Input 
                    type="password" 
                    placeholder="Create Password" 
                    className="pl-5"
                    error={errors.password?.message}
                    {...register("password")}
                />
            </motion.div>
        </div>

        <button 
          disabled={isLoading}
          className="mt-4 w-full h-12 bg-slate-900 text-white rounded-full font-medium shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
        >
             {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Get Started"}
             {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
        </button>

         {/* Divider */}
        <div className="flex items-center gap-4 my-4">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Or sign up with</span>
            <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <button type="button" className="w-full h-12 bg-white border border-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
        </button>

        <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-slate-900 hover:underline decoration-slate-900/30">
                Sign in
            </Link>
        </p>
      </motion.form>
    </div>
  );
}
