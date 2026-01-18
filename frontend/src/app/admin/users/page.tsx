"use client";

import { motion } from "framer-motion";
import { Edit2, MoreHorizontal, Trash2, Search, Filter } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Checkbox } from "@/components/ui/Checkbox";

// Define the User type
type User = {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: "active" | "past_due" | "canceled" | "warning";
  mrr: string;
  joined: string;
};

// Mock Data
const ALL_USERS: User[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", plan: "Pro", status: "active", mrr: "$49.00", joined: "Oct 24, 2025" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", plan: "Starter", status: "past_due", mrr: "$19.00", joined: "Nov 02, 2025" },
  { id: 3, name: "Charlie Davis", email: "charlie@studio.com", plan: "Business", status: "active", mrr: "$99.00", joined: "Dec 15, 2025" },
  { id: 4, name: "Diana Prince", email: "diana@amazon.com", plan: "Pro", status: "canceled", mrr: "$0.00", joined: "Jan 05, 2026" },
  { id: 5, name: "Evan Wright", email: "evan@write.com", plan: "Starter", status: "active", mrr: "$19.00", joined: "Jan 12, 2026" },
  { id: 6, name: "Fiona Gallagher", email: "fiona@chicago.com", plan: "Pro", status: "active", mrr: "$49.00", joined: "Jan 20, 2026" },
  { id: 7, name: "George Bailey", email: "george@life.com", plan: "Business", status: "active", mrr: "$99.00", joined: "Jan 22, 2026" },
  { id: 8, name: "Hannah Montana", email: "hannah@disney.com", plan: "Pro", status: "active", mrr: "$49.00", joined: "Jan 25, 2026" },
];

const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => (
      <div>
        <div className="font-bold text-slate-900">{row.getValue("name")}</div>
        <div className="text-xs text-slate-500 font-medium">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => (
        <span className="text-sm font-medium text-slate-700">{row.getValue("plan")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
            <Badge variant={
                status === 'active' ? 'active' :
                status === 'past_due' ? 'warning' :
                'secondary'
            }>
                {status.replace('_', ' ')}
            </Badge>
        )
    },
  },
  {
    accessorKey: "mrr",
    header: "MRR",
    cell: ({ row }) => <div className="font-mono text-slate-600">{row.getValue("mrr")}</div>,
  },
  {
    accessorKey: "joined",
    header: "Joined",
    cell: ({ row }) => <div className="text-slate-500">{row.getValue("joined")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
              Copy Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit User</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-600">Delete User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

import { DownloadCloud, Loader2 } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useState } from "react";

// ... existing code ...

export default function AdminUsersPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
        const response = await api.get('/admin/users/export', { responseType: 'blob' });
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'users-export.csv');
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success("Users exported successfully");
    } catch (error) {
        console.error("Export failed", error);
        toast.error("Failed to export users");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-serif italic font-bold text-slate-900 mb-2">Users</h1>
                <p className="text-slate-500 font-sans font-medium">Manage your user base permissions and subscriptions.</p>
            </div>
             <button className="h-10 px-6 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                Add User
            </button>
      </header>

      <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm p-1">
          <DataTable 
            columns={columns} 
            data={ALL_USERS} 
            searchKey="name" 
            searchPlaceholder="Search users..."
            toolbarActions={
                <Button 
                    variant="outline" 
                    className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-700"
                    onClick={handleExport}
                    disabled={isExporting}
                >
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DownloadCloud className="mr-2 h-4 w-4" />}
                    Export CSV
                </Button>
            }
          />
      </div>
    </motion.div>
  );
}
