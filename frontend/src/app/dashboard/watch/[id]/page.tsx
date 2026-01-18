"use client";

import { Play, Pause, Volume2, Maximize, SkipForward, CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Mock Playlist
const PLAYLIST = [
    { id: 1, title: "1. Introduction to Hooks", duration: "5:20", completed: true },
    { id: 2, title: "2. The useEffect Dependency Array", duration: "8:45", completed: true },
    { id: 3, title: "3. Custom Hooks Patterns", duration: "12:30", active: true },
    { id: 4, title: "4. Performance Optimization", duration: "15:00", completed: false },
    { id: 5, title: "5. Real-world Examples", duration: "20:15", completed: false },
];

export default function WatchPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-100px)]">
      {/* Main Player Area */}
      <div className="flex-1">
          {/* Header */}
         <div className="mb-6">
            <p className="text-sm font-medium text-indigo-600 mb-1">Module 3</p>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                Custom Hooks Patterns
            </h1>
         </div>

         {/* Video Player Container */}
         <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl group">
             {/* Mock Video Placeholder */}
             <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                 <span className="text-slate-500 font-medium">Video Content Placeholder</span>
             </div>

             {/* Custom Controls Overlay */}
             <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                 {/* Progress Bar */}
                 <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer hover:h-1.5 transition-all">
                     <div className="w-1/3 h-full bg-indigo-500 rounded-full relative">
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
                     </div>
                 </div>

                 {/* Control Buttons */}
                 <div className="flex items-center justify-between text-white">
                     <div className="flex items-center gap-6">
                         <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="hover:text-indigo-400 transition-colors"
                         >
                             {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                         </button>
                         <button className="hover:text-indigo-400 transition-colors">
                             <SkipForward size={24} />
                         </button>
                         <div className="flex items-center gap-2 group/volume">
                             <Volume2 size={20} />
                             <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
                                 <div className="w-20 h-1 bg-white/20 rounded-full ml-2">
                                     <div className="w-3/4 h-full bg-white rounded-full"></div>
                                 </div>
                             </div>
                         </div>
                         <span className="text-sm font-medium opacity-80">04:20 / 12:30</span>
                     </div>
                     
                     <div className="flex items-center gap-4">
                         <button className="px-2 py-1 bg-white/10 rounded hover:bg-white/20 text-xs font-bold backdrop-blur-sm">
                             1.0x
                         </button>
                         <Maximize size={20} className="hover:text-indigo-400 cursor-pointer" />
                     </div>
                 </div>
             </div>
         </div>
      </div>

      {/* Sidebar Playlist */}
      <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-2xl h-fit overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-serif font-bold text-slate-900">Course Content</h3>
              <span className="text-xs font-medium text-slate-500">2/5 Completed</span>
          </div>
          
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {PLAYLIST.map((lesson) => (
                  <div 
                    key={lesson.id} 
                    className={cn(
                        "p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer group",
                        lesson.active ? "bg-indigo-50/50 hover:bg-indigo-50" : ""
                    )}
                  >
                      <div className="mt-1">
                          {lesson.completed ? (
                              <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                  <CheckCircle2 size={12} />
                              </div>
                          ) : lesson.active ? (
                              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                  <Play size={10} fill="currentColor" />
                              </div>
                          ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-200 text-transparent"></div>
                          )}
                      </div>
                      
                      <div className="flex-1">
                          <p className={cn(
                              "text-sm font-medium mb-1 group-hover:text-indigo-700 transition-colors",
                              lesson.active ? "text-indigo-900" : "text-slate-700"
                          )}>
                              {lesson.title}
                          </p>
                          <span className="text-xs text-slate-400">{lesson.duration}</span>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}
