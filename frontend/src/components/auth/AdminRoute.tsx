"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FullPageSpinner } from "@/components/ui/FullPageSpinner";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (user?.role !== 'admin') {
            router.push('/dashboard'); // Redirect non-admins to dashboard
        }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // Will redirect
  }

  return <>{children}</>;
}
