"use client";

import { motion } from "framer-motion";

export const BackgroundGradients = () => {
  return (
    <>
      {/* Ambient Background Gradients (Matches index.html lines 188-191) */}
      <div className="fixed overflow-hidden -z-10 pointer-events-none w-full h-full top-0 left-0">
        <motion.div 
            animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.3, 0.5]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gray-200/50 rounded-full blur-[120px]"
        />
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.2, 0.4]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[10%] right-[-5%] w-[30%] h-[50%] rounded-full blur-[100px] bg-indigo-100/40"
        />
      </div>
    </>
  );
};
