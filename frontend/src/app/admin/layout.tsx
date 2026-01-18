"use client";

import AdminRoute from "@/components/auth/AdminRoute";

import { LayoutGrid, BarChart2, GitBranch, FileText, Users, Settings, ChevronDown, CreditCard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { Logo } from "@/components/ui/Logo";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Users", href: "/admin/users", icon: Users, active: pathname === "/admin/users" },
    { name: "Plans", href: "/admin/plans", icon: FileText, active: pathname === "/admin/plans" },
    { name: "Content", href: "/admin/content", icon: LayoutGrid, active: pathname === "/admin/content" },
    { name: "Financials", href: "/admin/payments", icon: CreditCard, active: pathname === "/admin/payments" },
    { name: "System Logs", href: "/admin/analytics", icon: BarChart2, active: pathname === "/admin/analytics" },
  ];

  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-white">
        {/* Sidebar - Precision Clone from index.html */}
        <aside className="hidden md:flex flex-col bg-[#FCFCFD] w-64 border-gray-100 border-r pt-5 pr-5 pb-5 pl-5 fixed h-full left-0 top-0 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/admin">
                <Logo />
            </Link>
            <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
          </div>

          {/* Status Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] text-blue-600 font-sans font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              Eng
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-600 font-sans font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Design
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-[10px] text-purple-600 font-sans font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              Product
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors font-sans font-medium",
                  item.active
                    ? "bg-[#0F172A] text-white shadow-md shadow-slate-900/10"
                    : "text-slate-600 hover:bg-gray-100"
                )}
              >
                <item.icon className={cn("w-4 h-4", item.active ? "opacity-90" : "")} />
                {item.name}
                {item.active && (
                  <div className="w-2 h-2 ml-auto rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="mt-auto pt-6 border-t border-gray-100">
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 text-sm transition-colors font-sans font-medium"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:pl-64">
          {children}
        </main>
      </div>
    </AdminRoute>
  );
}
