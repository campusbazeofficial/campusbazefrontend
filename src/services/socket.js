// src/services/socket.js
// Singleton Socket.io client. chatStore has its own separate socket — this
// handles everything else (notifications, wallet, errands, orders, etc.)
// Install: npm install socket.io-client
import { io } from 'socket.io-client'

export const SOCKET_EVENTS = {
  CONNECT:       'connect',
  DISCONNECT:    'disconnect',
  CONNECT_ERROR: 'connect_error',

  NOTIFICATION_NEW:     'notification:new',
  NOTIFICATION_COUNT:   'notification:count',
  NOTIFICATION_READ:    'notification:read',

  WALLET_UPDATED:       'wallet:updated',

  ERRAND_UPDATED:       'errand:updated',
  ERRAND_BID_NEW:       'errand:bid:new',

  ORDER_UPDATED:        'order:updated',

  VERIFICATION_RESULT:  'verification:result',
  SUBSCRIPTION_UPDATED: 'subscription:updated',

  USER_SUSPENDED:       'user:suspended',
  USER_UNSUSPENDED:     'user:unsuspended',

  ADMIN_VERIFICATION_NEW:     'admin:verification:new',
  ADMIN_VERIFICATION_UPDATED: 'admin:verification:updated',
  ADMIN_ERRAND_DISPUTED:      'admin:errand:disputed',
  ADMIN_ORDER_DISPUTED:       'admin:order:disputed',
  ADMIN_USER_REGISTERED:      'admin:user:registered',
  ADMIN_CLEARANCE_NEW:        'admin:clearance:new',
}

let _socket     = null
let _connecting = false
// When true, all onConnectionChange callbacks are silenced.
// Set during intentional disconnect so teardown never triggers side-effects.
let _silenced   = false
const _handlers            = new Map()  // event → Set<fn>
const _connectionCallbacks = new Set()  // connection state observers

function _notify(connected) {
  if (_silenced) return
  _connectionCallbacks.forEach(cb => { try { cb(connected) } catch {} })
}

function _wire() {
  _socket.on(SOCKET_EVENTS.CONNECT, () => {
    _connecting = false
    _notify(true)
  })
  _socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
    // Only notify on unexpected drops, not our own .disconnect() call
    if (reason !== 'io client disconnect') _notify(false)
  })
  _socket.on(SOCKET_EVENTS.CONNECT_ERROR, () => {
    _connecting = false
    // No notification — automatic reconnect will handle recovery
  })
}

export const socketService = {
  connect(token) {
    if (!token) return
    const url = import.meta.env.VITE_SOCKET_URL
              || import.meta.env.VITE_API_BASE_URL
              || 'https://campusbasebackend.onrender.com'

    if (_socket) {
      // Already have a socket — just refresh the token
      _socket.auth = { token }
      if (!_socket.connected) _socket.connect()
      return
    }

    _silenced   = false
    _connecting = true
    _socket = io(url, {
      auth:                 { token },
      transports:           ['websocket', 'polling'],
      reconnection:         true,
      reconnectionAttempts: Infinity,
      reconnectionDelay:    2000,
      reconnectionDelayMax: 30000,
      randomizationFactor:  0.5,
      timeout:              10000,
      withCredentials:      true,
    })

    _wire()
    // Re-attach any handlers registered before connect() was called
    _handlers.forEach((set, event) => set.forEach(fn => _socket.on(event, fn)))
  },

  // Intentional disconnect — silences all callbacks so nothing downstream
  // fires synchronously during logout/teardown.
  disconnect() {
    if (!_socket) return
    _silenced = true
    _socket.removeAllListeners()
    _socket.disconnect()
    _socket     = null
    _connecting = false
    _handlers.clear()
    // Restore after current call stack so future connects work normally
    setTimeout(() => { _silenced = false }, 0)
  },

  on(event, fn) {
    if (!_handlers.has(event)) _handlers.set(event, new Set())
    _handlers.get(event).add(fn)
    _socket?.on(event, fn)
  },

  off(event, fn) {
    if (fn) {
      _handlers.get(event)?.delete(fn)
      _socket?.off(event, fn)
    } else {
      _handlers.delete(event)
      _socket?.removeAllListeners(event)
    }
  },

  emit(event, data) {
    _socket?.connected && _socket.emit(event, data)
  },

  // Returns an unsubscribe function
  onConnectionChange(cb) {
    _connectionCallbacks.add(cb)
    return () => _connectionCallbacks.delete(cb)
  },

  get isConnected()  { return _socket?.connected ?? false },
  get isConnecting() { return _connecting },
}