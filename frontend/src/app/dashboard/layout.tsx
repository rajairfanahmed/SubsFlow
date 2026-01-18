"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import PageTransition from "@/components/layout/PageTransition";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

import { Bell, Search, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
       <div className="flex min-h-screen bg-[#F8F9FB]">
         {/* Professional Sidebar */}
         <Sidebar />

         {/* Main Content */}
         <main className="flex-1 ml-72">
            {/* Topbar */}
            <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-20 bg-[#F8F9FB]/80 backdrop-blur-md border-b border-white/50">
               <div className="w-96">
                   <div className="relative group">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                       <input 
                           type="text" 
                           placeholder="Search content..."
                           className="w-full h-10 pl-10 pr-4 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all shadow-sm focus:shadow-md"
                       />
                   </div>
               </div>
               
               <div className="flex items-center gap-4">
                   <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-500/10 transition-all relative">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-full outline-none ring-2 ring-transparent focus:ring-indigo-500/20 transition-all">
                            <Avatar className="w-9 h-9 border border-slate-200 shadow-sm">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold">JD</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Link href="/dashboard/settings" className="flex w-full">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuItem>Subscription</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500 focus:text-red-500 font-medium">
                             Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
               </div>
            </header>

            <div className="p-8 pb-20">
                <PageTransition>
                    {children}
                </PageTransition>
            </div>
         </main>
       </div>
    </ProtectedRoute>
  );
}

