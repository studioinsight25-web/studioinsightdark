'use client'

import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

const typeClasses = {
  success: {
    bg: 'bg-green-500/95 border-green-400',
    icon: CheckCircle,
    iconColor: 'text-green-100',
    progress: 'bg-green-300'
  },
  error: {
    bg: 'bg-red-500/95 border-red-400',
    icon: AlertCircle,
    iconColor: 'text-red-100',
    progress: 'bg-red-300'
  },
  info: {
    bg: 'bg-blue-500/95 border-blue-400',
    icon: Info,
    iconColor: 'text-blue-100',
    progress: 'bg-blue-300'
  },
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)
  const typeConfig = typeClasses[type]
  const Icon = typeConfig.icon

  useEffect(() => {
    // Auto-hide after 4 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Allow fade-out animation
    }, 4000)

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(progressInterval)
          return 0
        }
        return prev - (100 / 40) // 40 updates over 4 seconds
      })
    }, 100)

    return () => {
      clearTimeout(hideTimer)
      clearInterval(progressInterval)
    }
  }, [onClose])

  if (!isVisible) return null

  return (
    <div
      className={`relative p-4 pr-10 rounded-xl shadow-2xl text-white flex items-start gap-3 min-w-[320px] max-w-md border backdrop-blur-sm overflow-hidden
        ${typeConfig.bg} animate-in slide-in-from-top-5 fade-in`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <div 
          className={`h-full ${typeConfig.progress} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Icon */}
      <Icon className={`w-5 h-5 ${typeConfig.iconColor} flex-shrink-0 mt-0.5`} />

      {/* Message */}
      <p className="text-sm font-medium flex-1 leading-relaxed">{message}</p>

      {/* Close button */}
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
        className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-white/20 transition-colors active:scale-95"
        aria-label="Sluit melding"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
