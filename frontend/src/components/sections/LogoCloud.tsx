"use client"

import { motion } from "framer-motion"

const LOGOS = [
  {
    name: "Stripe",
    svg: (
      <svg viewBox="0 0 125 53" fill="currentColor" className="h-8">
        <path d="M49.6 22.8c-1.6-.9-3.4-1.6-5.4-2-2.1-.5-4.6-.3-5.2 2.3-.6 2.4 1 3.5 4 4.5 5.5 1.7 11.2 3.6 10.7 10.4-.5 7.6-8.9 9.8-15.1 9.8-6.1 0-11.2-2-12.2-8.5l9.2-1.9c.4 2.9 2.1 4.2 4.6 4.2 2.4 0 4.2-1.3 4.4-3.5.2-2.3-1.4-3.3-6.1-5-4.4-1.5-10.2-3.1-10.1-9.5.1-5.7 6.4-9.3 13.9-9.3 5.4 0 11.1 1.9 12 7.7l-9 1.3zM14.8 14.8h-9v36.6h9V14.8zm-4.7-4.1c2.9 0 5.2-2.4 5.2-5.3S12.9.1 10.1.1 4.9 2.5 4.9 5.4s2.3 5.3 5.2 5.3zM67.8 7.3h-9.3v7.3h-4v41.6h-9V21.4H41V17.8h4.5v-7C45.5 3.3 51 0 57.6 0c2.8 0 6.6.6 9 1.6l-2 7.7c-1.3-.5-2.6-.9-4-.8-3.1.2-4.1 2.2-4.1 5.3v4.1h9.3l-1.3 7.8H58.5V54H68V23.7h9.5V14.8h-9.8V7.3zM83.4 14.8h-9v36.6h9V14.8zm-4.7-4.1c2.9 0 5.2-2.4 5.2-5.3 0-2.9-2.3-5.3-5.2-5.3s-5.2 2.4-5.2 5.3c.1 2.9 2.4 5.3 5.2 5.3zM108.8 35c-.8 6-5.3 8.8-10.6 8.8-5.3 0-8.9-3.9-8.9-9.3v-1.1c.1-6.1 4-9.6 9.8-9.6 1.4 0 4.7.3 6.6 2.3l6.2-5.8c-3.1-3.6-8-5.2-12.4-5.2-11.2 0-19.5 8.3-19.5 19.3S88.6 54 99.4 54c6.2 0 10.9-2.6 14-6.4l-6.3-5.5c-1.4 1.8-2 2.6-2.5 3l4.2-10.1z" />
      </svg>
    ),
  },
  {
    name: "Vercel",
    svg: (
      <svg viewBox="0 0 1155 1000" fill="currentColor" className="h-6">
        <path d="M577.344 0L1154.69 1000H0L577.344 0Z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    svg: (
      <svg viewBox="0 0 98 96" fill="currentColor" className="h-8">
         <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" />
      </svg>
    ),
  },
   {
    name: "Next.js",
    svg: (
      <svg viewBox="0 0 180 180" fill="currentColor" className="h-8">
           <path d="M180 90c0 49.706-40.294 90-90 90S0 139.706 0 90 40.294 0 90 0s90 40.294 90 90z" fill="black" fillOpacity="0" stroke="currentColor" strokeWidth="12" />
           <path d="M153.275 125.808L80.598 33H65v114h15.281V58.623l66.969 88.599c2.31 1.056 4.672 1.989 7.086 2.793v-24.207h-1.061zM115.5 33h15.28v114h-15.28V33z" />
      </svg>
    ),
  },
  {
    name: "Prisma",
     svg: (
         <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 font-serif font-bold italic w-auto">
             <text x="0" y="20" fontSize="20" fontFamily="serif">Prisma</text>
         </svg>
     )
  }
]

export function LogoCloud() {
  return (
    <section className="py-12 border-b border-slate-100 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-center text-sm font-medium text-slate-500 mb-8 uppercase tracking-widest">
            Trusted by innovative teams
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 hover:opacity-100 transition-opacity duration-300">
          {LOGOS.map((logo) => (
            <motion.div
                key={logo.name}
                whileHover={{ scale: 1.05 }}
                className="text-slate-900"
            >
                {logo.svg}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
