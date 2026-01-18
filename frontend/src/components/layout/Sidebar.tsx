"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { 
  BarChart2, 
  CreditCard, 
  LayoutGrid, 
  Settings, 
  List, 
  LogOut, 
  User, 
  MoreHorizontal 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

const SECTIONS = [
  {
    title: "Platform",
    items: [
      { label: "Library", href: "/dashboard", icon: LayoutGrid },
      { label: "My List", href: "/dashboard/my-list", icon: List },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart2, adminOnly: true },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Billing", href: "/dashboard/subscription", icon: CreditCard },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-[#0F172A] fixed inset-y-0 left-0 z-30 flex flex-col py-8 border-r border-slate-800/50">
      {/* Logo Area */}
      <div className="px-8 mb-10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Logo textClassName="text-white" />
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="px-4 mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative",
                      isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {/* Active Background Pill (Motion) */}
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebar"
                        className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        initial={false}
                      />
                    )}

                    {/* Icon & Label (Z-Index to stay above pill) */}
                    <item.icon
                      size={18}
                      className={cn(
                        "relative z-10 transition-colors",
                         isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                      )}
                    />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="px-4 mt-auto pt-4 border-t border-slate-800">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors text-left group">
                    <Avatar className="h-9 w-9 border border-slate-700">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">John Doe</p>
                        <p className="text-xs text-slate-500 truncate group-hover:text-slate-400">john@example.com</p>
                    </div>
                    <MoreHorizontal size={16} className="text-slate-500 group-hover:text-white" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 ml-4" side="right" sideOffset={10}>
                <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" /> 
                    Profile
                </DropdownMenuItem>
                 <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" /> 
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" /> 
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
