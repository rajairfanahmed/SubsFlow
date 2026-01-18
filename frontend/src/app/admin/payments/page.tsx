"use client";

import { motion } from "framer-motion";
import { Download, Search, Filter, ArrowUpRight } from "lucide-react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { 
    Pagination, 
    PaginationContent, 
    PaginationItem, 
    PaginationLink, 
    PaginationNext, 
    PaginationPrevious 
} from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";

const TRANSACTIONS = [
  { id: "TX-9821", customer: "Alice Johnson", amount: "$49.00", status: "paid", date: "Oct 24, 2025", method: "Visa •••• 4242" },
  { id: "TX-9822", customer: "Bob Smith", amount: "$19.00", status: "failed", date: "Oct 24, 2025", method: "Mastercard •••• 8844" },
  { id: "TX-9823", customer: "Charlie Davis", amount: "$99.00", status: "paid", date: "Oct 23, 2025", method: "Amex •••• 1234" },
  { id: "TX-9824", customer: "Diana Prince", amount: "$49.00", status: "paid", date: "Oct 23, 2025", method: "Visa •••• 4242" },
  { id: "TX-9825", customer: "Evan Wright", amount: "$19.00", status: "refunded", date: "Oct 22, 2025", method: "PayPal" },
  { id: "TX-9826", customer: "Fiona Gallagher", amount: "$49.00", status: "paid", date: "Oct 22, 2025", method: "Visa •••• 4242" },
  { id: "TX-9827", customer: "George Bailey", amount: "$99.00", status: "paid", date: "Oct 21, 2025", method: "Mastercard •••• 5522" },
];

export default function AdminPaymentsPage() {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-serif italic font-bold text-slate-900 mb-2">Payments</h1>
                <p className="text-slate-500 font-sans font-medium">View and manage all transaction history.</p>
            </div>
            <div className="flex items-center gap-3">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search transactions..." className="pl-9 h-10 w-full" />
                 </div>
                 <button className="h-10 px-4 border border-slate-200 rounded-full flex items-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    <Filter size={16} />
                    Filters
                 </button>
                <button className="h-10 px-6 bg-white border border-slate-200 text-slate-700 rounded-full font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                    <Download size={16} />
                    Export
                </button>
            </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
          <Table>
              <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {TRANSACTIONS.map((tx) => (
                      <TableRow key={tx.id} className="group">
                          <TableCell className="font-mono text-xs text-slate-500">{tx.id}</TableCell>
                          <TableCell>
                              <span className="font-medium text-slate-900">{tx.customer}</span>
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">{tx.amount}</TableCell>
                          <TableCell>
                              <Badge variant={
                                  tx.status === 'paid' ? 'active' :
                                  tx.status === 'failed' ? 'destructive' :
                                  'secondary'
                              }>
                                  {tx.status}
                              </Badge>
                          </TableCell>
                          <TableCell className="text-slate-500">{tx.date}</TableCell>
                          <TableCell className="text-slate-600 text-sm">{tx.method}</TableCell>
                          <TableCell className="text-right">
                              <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1 ml-auto">
                                  View
                                  <ArrowUpRight size={12} />
                              </button>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
          
          <div className="p-4 border-t border-slate-100">
             <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#" />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
          </div>
      </div>
    </motion.div>
  );
}
