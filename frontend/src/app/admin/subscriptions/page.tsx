"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { subscriptionService } from "@/services/subscription.service";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { MoreHorizontal, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

// Initial Empty State if needed
function EmptyState() {
  return (
    <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">📦</span>
      </div>
      <h3 className="text-lg font-serif text-slate-900 mb-2">No subscriptions found</h3>
      <p className="text-slate-500 max-w-md mx-auto">
        There are no active subscriptions in the system yet.
      </p>
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // In a real app we'd handle pagination
      const data = await subscriptionService.getAllSubscriptions();
      setSubscriptions(data || []);
    } catch (error) {
      console.error("Failed to load subscriptions", error);
      toast("Failed to load subscriptions", { type: "error" });
      setSubscriptions([]); // Fallback to empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleCancelClick = (id: string) => {
    setSelectedSubId(id);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedSubId) return;
    
    setProcessingId(selectedSubId);
    try {
      await subscriptionService.cancelSubscription(selectedSubId);
      toast("Subscription cancelled successfully", { type: "success" });
      setCancelModalOpen(false);
      // Refresh list
      fetchSubscriptions();
    } catch (error) {
      toast("Failed to cancel subscription", { type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <header>
           <h1 className="text-3xl font-serif text-slate-900 mb-2">Active Subscriptions</h1>
           <p className="text-slate-500">Manage user subscriptions and billing status.</p>
        </header>

        {loading ? (
             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 space-y-4">
                   {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                         <Skeleton className="h-10 w-10 rounded-full" variant="circular" />
                         <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/4" variant="text" />
                            <Skeleton className="h-3 w-1/3" variant="text" />
                         </div>
                         <Skeleton className="h-8 w-20" />
                      </div>
                   ))}
                </div>
             </div>
        ) : subscriptions.length === 0 ? (
            <EmptyState />
        ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4 font-serif">User</th>
                            <th className="px-6 py-4 font-serif">Plan</th>
                            <th className="px-6 py-4 font-serif">Amount</th>
                            <th className="px-6 py-4 font-serif">Status</th>
                            <th className="px-6 py-4 font-serif">Next Billing</th>
                            <th className="px-6 py-4 font-serif text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {subscriptions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                            {sub.user?.name?.[0] || "U"}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{sub.user?.name || "Unknown User"}</div>
                                            <div className="text-xs text-slate-500">{sub.user?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge variant={sub.plan?.interval === 'year' ? 'default' : 'outline'}>
                                        {sub.plan?.name || "Standard"}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 font-mono text-sm text-slate-600">
                                    ${(sub.plan?.amount / 100).toFixed(2)}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge 
                                        variant="default" 
                                        className={
                                            sub.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 
                                            sub.status === 'canceled' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-slate-100 text-slate-700'
                                        }
                                    >
                                        {sub.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {format(new Date(sub.currentPeriodEnd), "MMM d, yyyy")}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="relative inline-block text-left">
                                        <button 
                                            onClick={() => handleCancelClick(sub.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                            title="Cancel Subscription"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
            {cancelModalOpen && (
                <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Cancel Subscription">
                    <div className="space-y-6">
                        <div className="bg-red-50 p-4 rounded-xl flex gap-3 text-red-700">
                            <AlertTriangle className="shrink-0" />
                            <p className="text-sm">
                                Are you sure you want to cancel this subscription? The user will lose access at the end of the billing period.
                            </p>
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setCancelModalOpen(false)}
                                className="px-4 py-2 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                            >
                                Keep Active
                            </button>
                            <button 
                                onClick={confirmCancel}
                                disabled={!!processingId}
                                className="px-4 py-2 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-600/20 disabled:opacity-70"
                            >
                                {processingId ? "Cancelling..." : "Confirm Cancel"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}
