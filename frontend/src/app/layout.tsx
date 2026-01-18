import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google"; // Instrument Serif requested
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Preloader } from "@/components/layout/Preloader";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400", // Instrument Serif only has 400
  style: ["normal", "italic"],
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
          inter.variable,
          instrumentSerif.variable
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
