"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

import { Hexagon, LayoutGrid, Play, CreditCard, BarChart2, Bell, Search, LogOut, Settings, List } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Logo } from "@/components/ui/Logo";

const NAV_ITEMS = [
  { label: "Library", href: "/dashboard", icon: LayoutGrid },
  { label: "My List", href: "/dashboard/my-list", icon: List },
  { label: "Billing", href: "/dashboard/subscription", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
       <div className="flex min-h-screen bg-[#F8F9FB]">
         {/* Sidebar - Dark Mode (Prism Mockup Style) */}
         <aside className="w-72 bg-[#0F172A] fixed inset-y-0 left-0 z-30 flex flex-col items-center py-8">
            {/* ... sidebar content ... */}
            <div className="mb-10">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                   <Logo textClassName="text-white" />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="w-full px-4 space-y-2">
               {NAV_ITEMS.map((item) => {
                   const isActive = pathname === item.href;
                   return (
                       <Link
                           key={item.href}
                           href={item.href}
                           className={cn(
                               "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all group relative",
                               isActive 
                                   ? "bg-white/10 text-white shadow-lg backdrop-blur-sm" 
                                   : "text-slate-400 hover:bg-white/5 hover:text-white"
                           )}
                       >
                            <item.icon size={20} className={cn(isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                            {item.label}
                            {isActive && (
                               <motion.div
                                   layoutId="activeDashNav"
                                   className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"
                               />
                            )}
                       </Link>
                   )
               })}
            </nav>

            {/* Footer */}
            <div className="mt-auto w-full px-4">
               <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl text-sm font-medium transition-colors">
                   <LogOut size={20} />
                   Sign Out
               </button>
            </div>
         </aside>

         {/* Main Content */}
         <main className="flex-1 ml-72">
            {/* Topbar */}
            <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-20 bg-[#F8F9FB]/80 backdrop-blur-md border-b border-white/50">
               <div className="w-96">
                   <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                           type="text" 
                           placeholder="Search content..."
                           className="w-full h-10 pl-10 pr-4 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all shadow-sm"
                       />
                   </div>
               </div>
               
               <div className="flex items-center gap-4">
                   <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:shadow-md transition-all relative">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-white"></span>
                </button>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-full outline-none ring-2 ring-transparent focus:ring-slate-200 transition-all">
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Link href="/dashboard/settings" className="flex w-full">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuItem>Subscription</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500 focus:text-red-500">
                             Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
               </div>
            </header>

            <div className="p-8 pb-20">
                {children}
            </div>
         </main>
       </div>
    </ProtectedRoute>
  );
}
