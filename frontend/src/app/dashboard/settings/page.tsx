"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Switch } from "@/components/ui/Switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Card } from "@/components/ui/Card"
import { Separator } from "@/components/ui/Separator" // We might need to build Separator or just use hr
import { motion } from "framer-motion"
import { useState } from "react"
import { Bell, User, Shield, CreditCard } from "lucide-react"

export default function SettingsPage() {
    const [emailAlerts, setEmailAlerts] = useState(true)
    const [pushNotifs, setPushNotifs] = useState(false)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account preferences and profile.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start border-b border-slate-200 bg-transparent p-0 mb-8 rounded-none">
          <TabsTrigger 
            value="profile" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 pb-3 pt-2 font-medium text-slate-500 data-[state=active]:text-indigo-600 shadow-none"
          >
             <User size={16} className="mr-2" />
             Profile
          </TabsTrigger>
          <TabsTrigger 
            value="notifications"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 pb-3 pt-2 font-medium text-slate-500 data-[state=active]:text-indigo-600 shadow-none"
          >
             <Bell size={16} className="mr-2" />
             Notifications
          </TabsTrigger>
           <TabsTrigger
            value="security"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 pb-3 pt-2 font-medium text-slate-500 data-[state=active]:text-indigo-600 shadow-none"
          >
             <Shield size={16} className="mr-2" />
             Security
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
              <Card className="p-6 space-y-8">
                  <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                      <p className="text-sm text-slate-500">Update your photo and personal details here.</p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24 border-4 border-slate-50">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm">Change Avatar</Button>
                        <p className="text-xs text-slate-400">JPG, GIF or PNG. 1MB max.</p>
                      </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                          <Label htmlFor="firstName">First name</Label>
                          <Input id="firstName" placeholder="Enter your first name" defaultValue="Raja" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="lastName">Last name</Label>
                          <Input id="lastName" placeholder="Enter your last name" defaultValue="Irfan" />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input id="email" type="email" placeholder="Enter your email" defaultValue="raja@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                       {/* Assuming Textarea exists or use Input for now */}
                      <Input id="bio" placeholder="Tell us a little about yourself" className="h-24" />
                  </div>

                  <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                      <Button variant="ghost">Cancel</Button>
                      <Button>Save Changes</Button>
                  </div>
              </Card>
          </motion.div>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications">
           <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
           >
              <Card className="p-6 divide-y divide-slate-100">
                 <div className="pb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Notification Preferences</h3>
                    <p className="text-sm text-slate-500">Choose what updates you want to receive.</p>
                 </div>
                 
                 <div className="py-6 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="font-medium text-slate-900">Email Alerts</div>
                        <div className="text-sm text-slate-500">Receive emails about your account activity.</div>
                    </div>
                    <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                 </div>

                 <div className="py-6 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="font-medium text-slate-900">Push Notifications</div>
                        <div className="text-sm text-slate-500">Receive push notifications on your device.</div>
                    </div>
                    <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                 </div>
                 
                  <div className="py-6 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="font-medium text-slate-900">Marketing Emails</div>
                        <div className="text-sm text-slate-500">Receive news, updates, and offers from SubsFlow.</div>
                    </div>
                    <Switch />
                 </div>
              </Card>
           </motion.div>
        </TabsContent>
        
         {/* SECURITY TAB (Placeholder) */}
         <TabsContent value="security">
             <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                 <Shield size={48} className="mx-auto mb-4 opacity-50" />
                 <h3 className="text-lg font-medium text-slate-900">Security Settings</h3>
                 <p>Two-factor authentication and password management coming soon.</p>
             </div>
         </TabsContent>

      </Tabs>
    </div>
  )
}
