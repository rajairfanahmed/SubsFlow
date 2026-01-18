"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Upload, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select" // We need to check if Select is compatible, otherwise use native select inside
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"

export default function CreateContentPage() {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4">
        <Link href="/admin/content">
             <Button variant="ghost" size="icon" className="rounded-full">
                 <ArrowLeft size={20} />
             </Button>
        </Link>
        <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">Add New Content</h1>
            <p className="text-slate-500 text-sm">Create a new video or article entry.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Content Details</CardTitle>
                      <CardDescription>Basic information about your content.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="space-y-2">
                          <Label>Title</Label>
                          <Input placeholder="e.g. Master Class 101" />
                      </div>
                      <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea placeholder="Describe what this content is about..." className="h-32" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <Label>Access Tier</Label>
                              <select className="flex h-12 w-full items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                  <option value="free">Free</option>
                                  <option value="pro">Pro (Paid)</option>
                                  <option value="business">Business (High Tier)</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <Label>Status</Label>
                               <select className="flex h-12 w-full items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                  <option value="draft">Draft</option>
                                  <option value="published">Published</option>
                                  <option value="archived">Archived</option>
                              </select>
                           </div>
                      </div>
                  </CardContent>
              </Card>
              
               <Card>
                  <CardHeader>
                      <CardTitle>Media Assets</CardTitle>
                      <CardDescription>Upload video and thumbnail.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <Upload size={20} />
                          </div>
                          <p className="text-sm font-medium text-slate-900">Upload Video File</p>
                          <p className="text-xs text-slate-500 mt-1">MP4, MOV or WebM up to 2GB</p>
                      </div>

                      <div className="flex items-center gap-4">
                          <div className="h-24 w-40 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
                              <ImageIcon size={24} />
                          </div>
                          <div>
                              <Button variant="outline" size="sm" className="mb-2">Upload Thumbnail</Button>
                              <p className="text-xs text-slate-500">Recommended: 1280x720px</p>
                          </div>
                      </div>
                  </CardContent>
               </Card>
          </div>
          
          {/* Sidebar / Preview */}
          <div className="space-y-6">
              <Card className="overflow-hidden">
                  <CardHeader className="bg-slate-50 border-b border-slate-100/50 pb-4">
                      <CardTitle className="text-sm">Preview</CardTitle>
                  </CardHeader>
                  <div className="aspect-video bg-slate-900 flex items-center justify-center text-white/50 relative">
                       {/* Video Player Preview would go here */}
                       <div className="absolute inset-0 flex items-center justify-center">
                           <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                               <div className="ml-1 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent"></div>
                           </div>
                       </div>
                       <p className="absolute bottom-4 left-4 text-xs font-medium">Video Preview</p>
                  </div>
                  <CardContent className="pt-6">
                      <div className="space-y-2 mb-4">
                          <div className="h-5 w-3/4 bg-slate-100 rounded"></div>
                          <div className="h-4 w-1/2 bg-slate-50 rounded"></div>
                      </div>
                      <div className="flex gap-2">
                           <div className="h-6 w-16 bg-indigo-100 rounded-full"></div>
                           <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
                      </div>
                  </CardContent>
                  <CardFooter className="border-t border-slate-100 pt-6 flex flex-col gap-3">
                      <Button className="w-full">Publish Content</Button>
                      <Button variant="outline" className="w-full">Save Draft</Button>
                  </CardFooter>
              </Card>
          </div>
      </div>
    </motion.div>
  )
}
