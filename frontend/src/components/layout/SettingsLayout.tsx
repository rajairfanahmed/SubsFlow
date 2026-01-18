"use client";

import { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface SettingsLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function SettingsLayout({ children, title = "Settings", subtitle = "Manage your account and preferences" }: SettingsLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    
    // Helper to determine active tab based on path
    const getActiveTab = () => {
        if (pathname.includes('/settings')) return 'profile'; // Default/Root
        if (pathname.includes('/account')) return 'account';
        if (pathname.includes('/billing')) return 'billing';
        if (pathname.includes('/notifications')) return 'notifications';
        return 'profile';
    };

    const handleTabChange = (value: string) => {
        // In a real app, strict routing would be better. For now we use the tab value to navigate.
        // Assuming /dashboard/settings is the base.
        if (value === 'profile') router.push('/dashboard/settings');
        // else router.push(`/dashboard/settings/${value}`); // Example
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Breadcrumb 
                    items={[
                        { label: "Dashboard", href: "/dashboard" },
                        { label: "Settings" }
                    ]} 
                    className="mb-4"
                />
                <h1 className="text-4xl font-serif font-medium text-slate-900 mb-2">{title}</h1>
                <p className="text-slate-500 text-lg">{subtitle}</p>
            </div>

            <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
                <div className="mb-8 border-b border-slate-100 pb-1">
                    <TabsList className="bg-slate-100/50 p-1 rounded-full">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="billing">Billing</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    </TabsList>
                </div>
                
                {children}
            </Tabs>
        </div>
    );
}
