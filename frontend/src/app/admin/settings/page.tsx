"use client";

import { motion } from "framer-motion";

export default function AdminSettingsPage() {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
    >
      <header className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Settings</h1>
            <p className="text-slate-500">Configure global application settings.</p>
      </header>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Platform Name</label>
              <input type="text" defaultValue="SubsFlow" className="w-full h-11 px-4 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"/>
          </div>
          
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Support Email</label>
              <input type="email" defaultValue="support@subsflow.com" className="w-full h-11 px-4 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"/>
          </div>

          <div className="pt-4 border-t border-slate-100">
               <h3 className="text-lg font-medium text-slate-900 mb-4">Feature Flags</h3>
               <div className="space-y-3">
                   <label className="flex items-center gap-3 cursor-pointer">
                       <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
                       <span className="text-slate-700">Enable Signups</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer">
                       <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
                       <span className="text-slate-700">Maintenance Mode</span>
                   </label>
               </div>
          </div>

          <div className="pt-6">
              <button className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                  Save Changes
              </button>
          </div>
      </div>
    </motion.div>
  );
}
