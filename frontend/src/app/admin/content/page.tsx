"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Video, Image as ImageIcon, MoreHorizontal, Edit2, Trash2 } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import Link from "next/link"

// Types
type ContentItem = {
    id: string
    title: string
    thumbnail: string
    duration: string
    tier: "free" | "pro" | "business"
    status: "published" | "draft" | "archived"
    views: number
    date: string
}

// Mock Data
const CONTENT_DATA: ContentItem[] = [
    { id: "1", title: "Getting Started with React", thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60", duration: "12:40", tier: "free", status: "published", views: 1240, date: "Oct 24, 2025" },
    { id: "2", title: "Advanced State Management", thumbnail: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&auto=format&fit=crop&q=60", duration: "45:10", tier: "pro", status: "published", views: 890, date: "Oct 26, 2025" },
    { id: "3", title: "Server Side Rendering", thumbnail: "https://images.unsplash.com/photo-1618477247222-ac59487b3364?w=800&auto=format&fit=crop&q=60", duration: "30:00", tier: "pro", status: "draft", views: 0, date: "Nov 02, 2025" },
    { id: "4", title: "Microservices Architecture", thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60", duration: "1:15:00", tier: "business", status: "published", views: 2400, date: "Nov 15, 2025" },
    { id: "5", title: "Testing Strategies", thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60", duration: "20:00", tier: "free", status: "published", views: 560, date: "Nov 20, 2025" },
]

const columns: ColumnDef<ContentItem>[] = [
    {
        accessorKey: "thumbnail",
        header: "Preview",
        cell: ({ row }) => (
            <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                {row.original.thumbnail ? (
                    <img src={row.original.thumbnail} alt={row.original.title} className="w-full h-full object-cover" />
                ) : (
                    <Video size={16} className="text-slate-400" />
                )}
            </div>
        )
    },
    {
        accessorKey: "title",
        header: "Content Title",
        cell: ({ row }) => (
            <div>
                <div className="font-bold text-slate-900">{row.getValue("title")}</div>
                <div className="text-xs text-slate-500 font-medium">{row.original.duration} • {row.original.date}</div>
            </div>
        )
    },
    {
        accessorKey: "tier",
        header: "Tier",
        cell: ({ row }) => {
            const tier = row.getValue("tier") as string
            return (
                <Badge variant={tier === 'free' ? 'secondary' : tier === 'pro' ? 'active' : 'outline'} className="uppercase text-[10px]">
                    {tier}
                </Badge>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                 <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${status === 'published' ? 'bg-emerald-500' : status === 'draft' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                    <span className="text-sm font-medium text-slate-700 capitalize">{status}</span>
                 </div>
            )
        }
    },
     {
        accessorKey: "views",
        header: "Views",
        cell: ({ row }) => <div className="font-mono text-slate-600 text-xs">{row.getValue<number>("views").toLocaleString()}</div>
    },
    {
        id: "actions",
        cell: ({ row }) => (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
]

export default function AdminContentPage() {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-serif italic font-bold text-slate-900 mb-2">Content Library</h1>
                <p className="text-slate-500 font-sans font-medium">Manage videos, articles, and exclusive content.</p>
            </div>
             <Link href="/admin/content/new">
                <button className="h-10 px-6 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2">
                    <Plus size={18} />
                    Add Content
                </button>
            </Link>
      </header>
       <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm p-1">
          <DataTable columns={columns} data={CONTENT_DATA} searchKey="title" searchPlaceholder="Search content..." />
       </div>
    </motion.div>
  )
}
