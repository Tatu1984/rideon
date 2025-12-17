'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import socketService from '@/src/services/socket.service'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const listenersRef = useRef(new Map())

  // Get token from localStorage (client-side only)
  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || localStorage.getItem('authToken')
    }
    return null
  }, [])

  // Connect to socket server
  const connect = useCallback(() => {
    const token = getToken()
    if (!token) {
      console.log('No auth token available for socket connection')
      return false
    }

    try {
      socketService.connect(token)
      return true
    } catch (error) {
      console.error('Socket connection error:', error)
      setConnectionError(error.message)
      return false
    }
  }, [getToken])

  // Disconnect from socket server
  const disconnect = useCallback(() => {
    socketService.disconnect()
    setIsConnected(false)
    setConnectionError(null)
  }, [])

  // Subscribe to an event
  const subscribe = useCallback((event, callback) => {
    socketService.on(event, callback)

    // Track for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, [])
    }
    listenersRef.current.get(event).push(callback)

    // Return unsubscribe function
    return () => {
      socketService.off(event, callback)
      const callbacks = listenersRef.current.get(event) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }, [])

  // Emit an event
  const emit = useCallback((event, data) => {
    socketService.emit(event, data)
  }, [])

  // Setup connection effect
  useEffect(() => {
    // Try to connect on mount if token exists
    const token = getToken()
    if (token) {
      connect()
    }

    // Listen for connection status changes
    const handleConnect = () => {
      setIsConnected(true)
      setConnectionError(null)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleError = (error) => {
      setConnectionError(error?.message || 'Connection error')
    }

    if (socketService.socket) {
      socketService.socket.on('connect', handleConnect)
      socketService.socket.on('disconnect', handleDisconnect)
      socketService.socket.on('connect_error', handleError)
    }

    // Cleanup on unmount
    return () => {
      if (socketService.socket) {
        socketService.socket.off('connect', handleConnect)
        socketService.socket.off('disconnect', handleDisconnect)
        socketService.socket.off('connect_error', handleError)
      }
    }
  }, [connect, getToken])

  // Listen for storage events (token changes)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'token' || e.key === 'authToken') {
        if (e.newValue) {
          connect()
        } else {
          disconnect()
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [connect, disconnect])

  const value = {
    isConnected,
    connectionError,
    connect,
    disconnect,
    subscribe,
    emit,

    // Convenience methods for common operations
    joinTrip: (tripId) => socketService.joinTrip(tripId),
    leaveTrip: (tripId) => socketService.leaveTrip(tripId),
    joinAdminRoom: () => socketService.joinAdminRoom(),
    sendTripMessage: (tripId, message, senderRole) => socketService.sendTripMessage(tripId, message, senderRole),
    triggerEmergency: (tripId, location, message) => socketService.triggerEmergency(tripId, location, message),

    // Subscribe shortcuts
    onTripStatusUpdate: (callback) => subscribe('trip:status-updated', callback),
    onDriverLocationUpdate: (callback) => subscribe('trip:driver-location', callback),
    onTripAccepted: (callback) => subscribe('trip:accepted', callback),
    onTripMessage: (callback) => subscribe('trip:message-received', callback),
    onDriversNearby: (callback) => subscribe('driver:location-updated', callback),
    onDriverOnline: (callback) => subscribe('driver:online', callback),
    onDriverOffline: (callback) => subscribe('driver:offline', callback),
    onEmergencyAlert: (callback) => subscribe('trip:emergency-alert', callback),
    onNewTripRequest: (callback) => subscribe('trip:new-request', callback),
    onNotification: (callback) => subscribe('notification', callback),
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

// Hook for subscribing to socket events with automatic cleanup
export function useSocketEvent(event, callback) {
  const { subscribe } = useSocket()

  useEffect(() => {
    const unsubscribe = subscribe(event, callback)
    return unsubscribe
  }, [event, callback, subscribe])
}
