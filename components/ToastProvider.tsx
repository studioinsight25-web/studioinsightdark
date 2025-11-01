'use client'

import { useToast, ToastProvider as ToastContextProvider } from '@/hooks/useToast'
import Toast from './Toast'

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastContextProvider>
      {children}
      <ToastContainer />
    </ToastContextProvider>
  )
}

