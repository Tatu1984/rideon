'use client'

import { useState, createContext, useContext, useCallback } from 'react'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'info',
    onConfirm: null,
    onCancel: null,
  })

  const confirm = useCallback(({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'info' }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setModalState(prev => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: () => {
          setModalState(prev => ({ ...prev, isOpen: false }))
          resolve(false)
        },
      })
    })
  }, [])

  const closeModal = useCallback(() => {
    if (modalState.onCancel) {
      modalState.onCancel()
    }
  }, [modalState])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmModal {...modalState} onClose={closeModal} />
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context
}

function ConfirmModal({ isOpen, title, message, confirmText, cancelText, type, onConfirm, onCancel, onClose }) {
  if (!isOpen) return null

  const typeStyles = {
    info: {
      icon: 'ℹ️',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
    },
    warning: {
      icon: '⚠️',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    danger: {
      icon: '🗑️',
      confirmBg: 'bg-red-600 hover:bg-red-700',
    },
    success: {
      icon: '✅',
      confirmBg: 'bg-green-600 hover:bg-green-700',
    },
  }

  const style = typeStyles[type] || typeStyles.info

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
          <div className="p-6">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 text-2xl mb-4">
              {style.icon}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              {title}
            </h3>

            {/* Message */}
            <p className="text-sm text-gray-500 text-center">
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.confirmBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
