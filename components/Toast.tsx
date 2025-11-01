'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }

  const colors = {
    success: 'bg-green-900/30 border-green-500/30 text-green-400',
    error: 'bg-red-900/30 border-red-500/30 text-red-400',
    info: 'bg-blue-900/30 border-blue-500/30 text-blue-400',
  }

  const Icon = icons[type]

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg border ${colors[type]} shadow-lg backdrop-blur-sm min-w-[300px] max-w-md animate-in slide-in-from-top-5 fade-in`}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

