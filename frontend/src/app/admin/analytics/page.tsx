"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowUpRight, TrendingUp, Users, CreditCard, Activity } from "lucide-react";

// Mock Data
const DATA = [
  { name: "Jan", mrr: 12000, users: 400 },
  { name: "Feb", mrr: 15500, users: 550 },
  { name: "Mar", mrr: 22000, users: 800 },
  { name: "Apr", mrr: 35000, users: 1200 },
  { name: "May", mrr: 45000, users: 1500 },
  { name: "Jun", mrr: 52000, users: 1800 },
  { name: "Jul", mrr: 58000, users: 2100 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full shadow-xl">
        <span className="font-bold">{label}:</span> ${payload[0].value.toLocaleString()}
      </div>
    );
  }
  return null;
};

import { DatePicker } from "@/components/ui/DatePicker";
import { useState } from "react";

// ... existing code ...

export default function AdminAnalyticsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-serif italic font-bold text-slate-900 mb-2">Analytics</h1>
                <p className="text-slate-500 font-sans font-medium">Deep dive into your platform's performance metrics.</p>
            </div>
            <DatePicker date={date} setDate={setDate} />
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: "Total MRR", value: "$58,000", change: "+12.5%", icon: CreditCard },
            { label: "Active Subs", value: "2,100", change: "+8.2%", icon: Users },
            { label: "Churn Rate", value: "1.2%", change: "-0.5%", icon: Activity },
        ].map((stat, i) => (
            <Card key={i}>
                <CardHeader className="pb-2">
                    <CardDescription className="uppercase tracking-wider font-bold text-xs">{stat.label}</CardDescription>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-4xl font-sans font-bold">{stat.value}</CardTitle>
                        <div className="p-2 bg-slate-50 rounded-full">
                            <stat.icon className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <TrendingUp size={12} />
                            {stat.change}
                        </span>
                        <span className="text-slate-400">vs last month</span>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* Main Chart */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>Monthly Recurring Revenue (MRR) over time.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DATA}>
                    <defs>
                        <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                        tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area 
                        type="monotone" 
                        dataKey="mrr" 
                        stroke="#4F46E5" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorMrr)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
