"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"

const TESTIMONIALS = [
  {
    quote: "SubsFlow has completely transformed how we handle our subscription revenue. The precision and clarity it provides is unmatched.",
    author: "Sarah Jenks",
    role: "CEO at Studio A",
    initials: "SJ"
  },
  {
    quote: "The best developer experience we've had. Integrating the API was seamless, and the UI components are simply beautiful.",
    author: "Mike Chen",
    role: "CTO at TechFlow",
    initials: "MC"
  },
  {
    quote: "Finally, a subscription platform that feels like it was designed for humans, not just robots. The dashboard is a joy to use.",
    author: "Elena Rodriguez",
    role: "Founder at ArtSpace",
    initials: "ER"
  },
  {
    quote: "We scaled from 100 to 10,000 subscribers in months, and SubsFlow didn't blink. It handles scale effortlessly.",
    author: "David Kim",
    role: "VP of Engineering at ScaleUp",
    initials: "DK"
  },
  {
    quote: "The analytics features are incredibly detailed. We can see our MRR breakdown in real-time.",
    author: "Lisa Pat",
    role: "CFO at VentureInc",
    initials: "LP"
  },
  {
    quote: "Customer support is top-notch. They actually listen to feature requests and implement them quickly.",
    author: "Tom Wilson",
    role: "Product Manager",
    initials: "TW"
  }
]

export function Testimonials() {
  return (
    <section className="py-24 bg-[#F8F9FB]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-serif text-slate-900 mb-4 italic">
            Loved by creators worldwide.
          </h2>
          <p className="text-slate-500 text-lg">
            Join thousands of businesses that trust SubsFlow to power their recurring revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-prism transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                    {/* Removed DiceBear to prevent network timeouts */}
                    <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold">{t.initials}</AvatarFallback>
                </Avatar>
                <div>
                   <p className="font-bold text-slate-900 text-sm">{t.author}</p>
                   <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
              <p className="text-lg font-serif italic text-slate-800 leading-relaxed">
                "{t.quote}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
