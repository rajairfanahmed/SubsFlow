"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Check, MoreVertical, Edit2, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
// Removed unused Modal imports as we use a custom implementation for now
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Switch } from "@/components/ui/Switch"

// Mock Data
const PLANS = [
  {
    id: "1",
    name: "Starter",
    price: 29,
    description: "Perfect for solopreneurs and beginners.",
    features: ["Access to core features", "5GB storage", "Community support"],
    active: true,
    color: "bg-slate-900"
  },
  {
    id: "2",
    name: "Pro",
    price: 99,
    description: "For growing teams and businesses.",
    features: ["Everything in Starter", "Unlimited storage", "Priority support", "Analytics"],
    active: true,
    color: "bg-indigo-600"
  },
  {
    id: "3",
    name: "Business",
    price: 299,
    description: "For large organizations.",
    features: ["Everything in Pro", "Dedicated manager", "SSO", "SLA"],
    active: true,
    color: "bg-purple-600"
  }
]

export default function AdminPlansPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-serif italic font-bold text-slate-900 mb-2">Subscription Plans</h1>
                <p className="text-slate-500 font-sans font-medium">Manage your pricing tiers and features.</p>
            </div>
             <Button onClick={() => setIsModalOpen(true)} className="rounded-full shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700">
                <Plus size={18} className="mr-2" />
                Add New Plan
            </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ y: -5 }}
                className="group relative"
              >
                  <Card className="h-full border-slate-200 hover:shadow-prism transition-shadow duration-300 overflow-hidden">
                      <div className={`h-2 w-full ${plan.color}`} />
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical size={16} className="text-slate-400" />
                          </Button>
                      </div>

                      <CardHeader className="pb-2">
                          <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                          <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-serif text-slate-900">${plan.price}</span>
                              <span className="text-slate-500 text-sm">/mo</span>
                          </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <p className="text-sm text-slate-500 h-10">{plan.description}</p>
                          <div className="space-y-2">
                              {plan.features.map((feature, i) => (
                                  <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                      <Check size={14} className="mt-0.5 text-indigo-500 shrink-0" />
                                      {feature}
                                  </div>
                              ))}
                          </div>
                      </CardContent>
                      <CardFooter className="pt-4 border-t border-slate-100 flex justify-between items-center">
                           <Badge variant={plan.active ? "active" : "secondary"}>
                               {plan.active ? "Active" : "Archived"}
                           </Badge>
                           <Button variant="outline" size="sm" className="rounded-full">Edit Plan</Button>
                      </CardFooter>
                  </Card>
              </motion.div>
          ))}
          
          {/* Add New Placeholder Card */}
          <motion.div
            onClick={() => setIsModalOpen(true)}
            whileHover={{ scale: 1.01 }}
            className="border-2 border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center p-8 gap-4 text-slate-400 cursor-pointer hover:border-indigo-300 hover:bg-slate-50/50 transition-colors min-h-[300px]"
          >
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <Plus size={32} />
              </div>
              <p className="font-medium">Create New Plan</p>
          </motion.div>
      </div>

      {/* Manual Modal Implementation since the reusable one might be simple */}
      <AnimatePresence>
          {isModalOpen && (
              <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                    onClick={() => setIsModalOpen(false)}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 p-0 overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-xl font-bold font-serif text-slate-900">Create New Plan</h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Plan Name</Label>
                                <Input placeholder="e.g. Enterprise" />
                            </div>
                            <div className="space-y-2">
                                <Label>Price (Monthly)</Label>
                                <Input type="number" placeholder="299" />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input placeholder="Short description for the card" />
                        </div>

                        <div className="space-y-2">
                            <Label>Features (One per line)</Label>
                            <Textarea placeholder="Everything in Pro..." className="min-h-[100px]" />
                        </div>

                         <div className="flex items-center justify-between py-2">
                            <Label>Active Status</Label>
                            <Switch defaultChecked />
                         </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button className="bg-slate-900 text-white hover:bg-slate-800">Create Plan</Button>
                    </div>
                </motion.div>
              </>
          )}
      </AnimatePresence>

    </motion.div>
  )
}
