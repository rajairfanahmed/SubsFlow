import type { Metadata } from "next";
import { Fraunces } from "next/font/google"; // Soft Serif
import { GeistSans } from "geist/font/sans"; // Vercel's New Sans
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Preloader } from "@/components/layout/Preloader";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  // Fraunces is a variable font, weights are automatic
});

export const metadata: Metadata = {
  title: "SubsFlow | Advanced Subscription Platform",
  description: "The production-grade platform for Creators, Educators, and Publishers. Manage subscriptions, gate content, and scale revenue.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased text-primary selection:bg-indigo-100 selection:text-indigo-600",
          GeistSans.variable,
          fraunces.variable
        )}
      >
        <Preloader />
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
