"use client";

import { MoreHorizontal, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Users, DollarSign, Activity, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";

// Mock Data for Users
const USERS = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", plan: "Pro", status: "active", mrr: "$49.00", joined: "Oct 24, 2025" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", plan: "Starter", status: "past_due", mrr: "$19.00", joined: "Nov 02, 2025" },
  { id: 3, name: "Charlie Davis", email: "charlie@studio.com", plan: "Business", status: "active", mrr: "$99.00", joined: "Dec 15, 2025" },
  { id: 4, name: "Diana Prince", email: "diana@amazon.com", plan: "Pro", status: "canceled", mrr: "$0.00", joined: "Jan 05, 2026" },
  { id: 5, name: "Evan Wright", email: "evan@write.com", plan: "Starter", status: "active", mrr: "$19.00", joined: "Jan 12, 2026" },
];

const CHART_DATA = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 2000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function AdminPage() {
  return (
    <motion.div 
        className="space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
      <motion.header variants={itemVariants}>
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Overview</h1>
            <p className="text-slate-500">Welcome back, Administrator.</p>
      </motion.header>

      {/* 1. Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="MRR" value="$12,450" change="+12.5%" trend="up" icon={DollarSign} delay={0} />
          <StatsCard title="Active Subs" value="1,240" change="+3.2%" trend="up" icon={Users} delay={0.1} />
          <StatsCard title="Churn Rate" value="2.4%" change="-0.5%" trend="down" isGood={true} icon={Activity} delay={0.2} />
          <StatsCard title="Total Views" value="45.2k" change="+24%" trend="up" icon={Eye} delay={0.3} />
      </div>

      {/* 2. Revenue Chart (New) */}
      <motion.div variants={itemVariants} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="mb-6">
              <h3 className="font-serif font-bold text-lg text-slate-900">Revenue Over Time</h3>
          </div>
          <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#1e293b' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
          </div>
      </motion.div>

      {/* 3. Users Table */}
      <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-slate-900">Recent Users</h3>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
          </div>
          
          <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="border-b border-slate-100">
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">User</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">Plan</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">Status</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">MRR</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">Joined</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody>
                  {USERS.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 last:border-0 group hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6">
                              <div>
                                  <p className="font-medium text-slate-900">{user.name}</p>
                                  <p className="text-xs text-slate-500">{user.email}</p>
                              </div>
                          </td>
                          <td className="py-4 px-6">
                              <span className="text-sm font-medium text-slate-700">{user.plan}</span>
                          </td>
                          <td className="py-4 px-6">
                              <StatusBadge status={user.status} />
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-600">{user.mrr}</td>
                          <td className="py-4 px-6 text-sm text-slate-500">{user.joined}</td>
                          <td className="py-4 px-6 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                                      <Edit2 size={16} />
                                  </button>
                                  <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </motion.div>
    </motion.div>
  );
}

// Stats Card with Icon and Trend
function StatsCard({ title, value, change, trend, isGood, icon: Icon, delay }: any) {
    const isPositive = trend === "up";
    const changeColor = (isPositive && !isGood) || (!isPositive && isGood) ? "text-emerald-600" : "text-emerald-600"; 

    return (
        <motion.div 
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-[140px]"
        >
            <div className="flex justify-between items-start">
                <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
                     <h4 className="text-3xl font-serif font-bold text-slate-900">{value}</h4>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                    <Icon size={20} />
                </div>
            </div>
            
            <div className={cn("text-sm font-medium flex items-center gap-1", 
                (trend === 'up' && !isGood) || (trend === 'down' && isGood) ? "text-emerald-600" : "text-emerald-600" 
            )}>
                {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {change}
                <span className="text-slate-400 font-normal ml-1">vs last month</span>
            </div>
        </motion.div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        active: "bg-emerald-100 text-emerald-700",
        canceled: "bg-slate-100 text-slate-600",
        past_due: "bg-amber-100 text-amber-700",
    };
    
    const labels = {
        active: "Active",
        canceled: "Canceled",
        past_due: "Past Due",
    };

    const s = status as keyof typeof styles;

    return (
        <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide", styles[s] || styles.active)}>
            {labels[s] || status}
        </span>
    );
}
