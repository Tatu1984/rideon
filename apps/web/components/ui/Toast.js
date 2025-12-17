'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  const typeStyles = {
    success: {
      bg: 'bg-green-50 border-green-500',
      icon: '✓',
      iconBg: 'bg-green-500',
      text: 'text-green-800',
    },
    error: {
      bg: 'bg-red-50 border-red-500',
      icon: '✕',
      iconBg: 'bg-red-500',
      text: 'text-red-800',
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-500',
      icon: '!',
      iconBg: 'bg-yellow-500',
      text: 'text-yellow-800',
    },
    info: {
      bg: 'bg-blue-50 border-blue-500',
      icon: 'i',
      iconBg: 'bg-blue-500',
      text: 'text-blue-800',
    },
  }

  const style = typeStyles[toast.type] || typeStyles.info

  return (
    <div
      className={`flex items-center gap-3 min-w-[300px] max-w-md p-4 rounded-lg border-l-4 shadow-lg transform transition-all duration-300 ${style.bg} ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${style.iconBg}`}>
        {style.icon}
      </div>
      <p className={`flex-1 text-sm font-medium ${style.text}`}>{toast.message}</p>
      <button
        onClick={onClose}
        className={`p-1 rounded hover:bg-black/10 ${style.text}`}
      >
        ✕
      </button>
    </div>
  )
}

export default Toast
