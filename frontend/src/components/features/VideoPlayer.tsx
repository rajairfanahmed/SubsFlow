"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Lock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
// import { Slider } from "@/components/ui/slider" // Assuming we might want a slider later, but using div for now as per minimal requirement

interface VideoPlayerProps {
  src?: string
  poster?: string
  isLocked?: boolean
  title?: string
  onUnlock?: () => void
}

export function VideoPlayer({ 
  src, 
  poster, 
  isLocked = false, 
  title,
  onUnlock 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)

  // Toggle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current || isLocked) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Handle Time Update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      setProgress((current / total) * 100)
    }
  }

  // Handle Loaded Metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  // Toggle Mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  // Seek Functionality
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || isLocked) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const percentage = x / width
    videoRef.current.currentTime = percentage * videoRef.current.duration
    setProgress(percentage * 100)
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-[32px] overflow-hidden shadow-2xl border border-slate-900/10 group">
      
      {/* Video Element */}
      {!isLocked && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
        />
      )}
      
      {/* Locked State Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center mb-6 border border-white/10">
                <Lock className="w-8 h-8 text-white/80" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-2">
                This content is locked
            </h3>
            <p className="text-white/60 mb-8 max-w-sm font-sans">
                Upgrade your subscription to premium to unlock this video and access all exclusive content.
            </p>
            <Button 
                variant="default" 
                size="lg"
                onClick={onUnlock}
                className="rounded-full px-8"
            >
                Upgrade to Watch
            </Button>
            
            {/* Background Image hint under blur */}
            {poster && (
                <div 
                    className="absolute inset-0 -z-10 bg-cover bg-center opacity-40 mix-blend-overlay"
                    style={{ backgroundImage: `url(${poster})` }}
                />
            )}
        </div>
      )}

      {/* Custom Controls Overlay (Only visible if unlocked) */}
      {!isLocked && (
        <div className="absolute inset-0 bg-transparent flex flex-col justify-end transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          
          {/* Big Center Play Button */}
          {!isPlaying && (
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                onClick={togglePlay}
              >
                  <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
              </div>
          )}

          {/* Bottom Control Bar */}
          <div className="bg-gradient-to-t from-black/80 to-transparent pt-20 pb-6 px-6">
            
            {/* Progress Bar */}
            <div 
                className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer relative group/progress"
                onClick={handleSeek}
            >
                <div 
                    className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all group-hover/progress:h-2 group-hover/progress:-top-0.5"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Play/Pause Small */}
                    <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition-colors">
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>

                    {/* Volume */}
                    <button onClick={toggleMute} className="text-white hover:text-indigo-400 transition-colors">
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    
                    {/* Title */}
                    {title && <span className="text-white/80 text-sm font-medium">{title}</span>}
                </div>

                {/* Fullscreen */}
                <button onClick={toggleFullscreen} className="text-white hover:text-indigo-400 transition-colors">
                    <Maximize size={20} />
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
