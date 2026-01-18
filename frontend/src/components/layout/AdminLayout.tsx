"use client";

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

import { LayoutGrid, Users, CreditCard, BarChart2, Bell, Search, LogOut, Settings, FileText, Layers } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import AdminRoute from "@/components/auth/AdminRoute";
import { Logo } from "@/components/ui/Logo";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: LayoutGrid },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Plans", href: "/admin/plans", icon: Layers },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AdminRoute>
       <div className="flex min-h-screen bg-[#F8F9FB]">
         {/* Sidebar - Light Mode for Admin */}
         <aside className="w-72 bg-white border-r border-slate-200 fixed inset-y-0 left-0 z-30 flex flex-col items-center py-8">
            <div className="mb-10">
              <Link href="/admin" className="flex items-center gap-3 group">
                   <Logo />
                   <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                     Admin
                   </span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="w-full px-4 space-y-1">
               {NAV_ITEMS.map((item) => {
                   const isActive = pathname === item.href;
                   return (
                       <Link
                           key={item.href}
                           href={item.href}
                           className={cn(
                               "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative",
                               isActive 
                                   ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                                   : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                           )}
                       >
                            <item.icon size={18} className={cn(isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                            {item.label}
                            {isActive && (
                               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-lg bg-indigo-600" />
                            )}
                       </Link>
                   )
               })}
            </nav>

            {/* Footer */}
            <div className="mt-auto w-full px-4 border-t border-slate-100 pt-6">
               <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
                   <LogOut size={18} />
                   Sign Out
               </button>
            </div>
         </aside>

         {/* Main Content */}
         <main className="flex-1 ml-72">
            {/* Topbar */}
            <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-20 bg-[#F8F9FB]/80 backdrop-blur-md border-b border-white/50">
               <div className="flex items-center gap-4">
                   <h2 className="font-serif text-xl text-slate-800">Administrator Console</h2>
               </div>
               
               <div className="flex items-center gap-4">
                   <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:shadow-md transition-all relative">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-white"></span>
                </button>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full bg-white border border-slate-200 hover:shadow-md transition-all">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                            <div className="text-left hidden md:block">
                                <div className="text-xs font-semibold text-slate-900">Admin User</div>
                                <div className="text-[10px] text-slate-500 leading-none">Super Admin</div>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Settings</DropdownMenuItem>
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
    </AdminRoute>
  );
}
