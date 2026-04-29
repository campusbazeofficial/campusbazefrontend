// src/api/api.js
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://campusbasebackend.onrender.com'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// ── Pending request cancellation ─────────────────────────
// Only track requests that we intentionally want to cancel
const pendingRequests = new Map()

function getRequestKey(config) {
  const { method, url } = config
  return `${method}|${url}`
}

// Add a request to the pending map only for specific endpoints
function addPendingRequest(config) {
  // ✅ Only deduplicate mutation endpoints (POST, PUT, PATCH, DELETE)
  // ✅ Never deduplicate GET requests or auth endpoints
  const method = config.method?.toLowerCase()
  if (method === 'get') return // Never deduplicate GET requests
  
  // Skip deduplication for these paths entirely
  const skipPaths = ['/auth', '/refresh', '/plans', '/subscription']
  if (skipPaths.some(path => config.url?.includes(path))) return
  
  const requestKey = getRequestKey(config)
  
  // Cancel any existing request to the same endpoint
  if (pendingRequests.has(requestKey)) {
    const { cancel } = pendingRequests.get(requestKey)
    if (typeof cancel === 'function') {
      cancel('Duplicate mutation request cancelled')
    }
    pendingRequests.delete(requestKey)
  }
  
  config.cancelToken = new axios.CancelToken((cancel) => {
    pendingRequests.set(requestKey, { cancel, timestamp: Date.now() })
  })
}

function removePendingRequest(config) {
  const requestKey = getRequestKey(config)
  pendingRequests.delete(requestKey)
}

export function cancelAllRequests() {
  pendingRequests.forEach((value, key) => {
    if (typeof value?.cancel === 'function') {
      value.cancel('Request cancelled due to navigation or logout')
    }
  })
  pendingRequests.clear()
}

// ── Error monitoring ──────────────────────────────────────
export const errorMonitor = {
  captureException: (error, context = {}) => {
    console.error('[ErrorMonitor]', error, context)
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: context })
    }
  },
  captureMessage: (message, context = {}) => {
    console.warn('[ErrorMonitor]', message, context)
    if (window.Sentry) {
      window.Sentry.captureMessage(message, { extra: context })
    }
  },
}

// ── Session manager ───────────────────────────────────────
class SessionManager {
  constructor() {
    this.proactiveTimer = null
    this.listeners = []
    this.isRefreshing = false
  }

  decodeToken(token) {
    try {
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      return {
        userId: decoded.userId,
        role: decoded.role,
        exp: decoded.exp * 1000,
        iat: decoded.iat * 1000,
      }
    } catch {
      return null
    }
  }

  getTimeUntilExpiry(token) {
    const decoded = this.decodeToken(token)
    if (!decoded?.exp) return 0
    return Math.max(0, decoded.exp - Date.now())
  }

  scheduleProactiveRefresh(token) {
    this.clearTimers()
    const timeUntilExpiry = this.getTimeUntilExpiry(token)
    if (timeUntilExpiry <= 0) {
      this.emit('expired', {})
      return
    }
    const REFRESH_BEFORE_EXPIRY_MS = 3 * 60 * 1000
    const refreshIn = Math.max(0, timeUntilExpiry - REFRESH_BEFORE_EXPIRY_MS)

    this.proactiveTimer = setTimeout(async () => {
      if (this.isRefreshing) return
      this.isRefreshing = true
      try {
        const storedRefreshToken = localStorage.getItem('refreshToken')
        if (!storedRefreshToken) {
          this.emit('expired', {})
          return
        }
        const response = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
        )
        const newAccessToken =
          response.data?.data?.tokens?.accessToken ||
          response.data?.data?.accessToken ||
          response.data?.accessToken
        const newRefreshToken =
          response.data?.data?.tokens?.refreshToken ||
          response.data?.data?.refreshToken ||
          response.data?.refreshToken
        if (!newAccessToken) throw new Error('No access token returned from refresh')
        localStorage.setItem('accessToken', newAccessToken)
        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)
        this.isRefreshing = false
        this.scheduleProactiveRefresh(newAccessToken)
      } catch (err) {
        this.isRefreshing = false
        const currentToken = localStorage.getItem('accessToken') || ''
        const remaining = this.getTimeUntilExpiry(currentToken)
        if (remaining <= 0) {
          this.emit('expired', {})
        }
      }
    }, refreshIn)
  }

  clearTimers() {
    if (this.proactiveTimer) {
      clearTimeout(this.proactiveTimer)
      this.proactiveTimer = null
    }
  }

  addEventListener(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback)
    }
  }

  emit(event, data) {
    this.listeners.forEach((callback) => callback(event, data))
  }

  reset() {
    this.clearTimers()
    this.isRefreshing = false
  }
}

export const sessionManager = new SessionManager()

function triggerLogout() {
  cancelAllRequests()
  sessionManager.reset()
  window.dispatchEvent(new Event('auth:logout'))
}

// ── Request interceptor ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    addPendingRequest(config)

    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ── First response interceptor — cleanup pending ──────────
api.interceptors.response.use(
  (response) => {
    removePendingRequest(response.config)
    return response
  },
  (error) => {
    if (error.config) removePendingRequest(error.config)
    return Promise.reject(error)
  }
)

// ── Reactive refresh queue ────────────────────────────────
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

function isTokenExpiredError(error) {
  const responseData = error.response?.data
  const message =
    responseData?.data?.message?.toLowerCase() ||
    responseData?.message?.toLowerCase() ||
    ''
  const expiredPatterns = ['token expired', 'jwt expired', 'token has expired', 'expired token']
  return (
    error.response?.status === 401 &&
    expiredPatterns.some((pattern) => message.includes(pattern))
  )
}

// ── Second response interceptor ───────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // ✅ Don't re-throw cancelled requests - just return a resolved promise
    if (axios.isCancel(error)) {
      return Promise.resolve({ data: null, cancelled: true })
    }

    if (error.message?.includes('CORS') || error.code === 'ERR_NETWORK') {
      errorMonitor.captureException(error, { type: 'network-error', url: originalRequest?.url })
      return Promise.reject(error)
    }

    if (error.code === 'ECONNABORTED') return Promise.reject(error)

    if (originalRequest?.url?.includes('/auth/refresh')) {
      triggerLogout()
      return Promise.reject(error)
    }

    const isExpired = isTokenExpiredError(error)

    if (error.response?.status === 401 && isExpired && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const storedRefreshToken = localStorage.getItem('refreshToken')
        if (!storedRefreshToken) throw new Error('No refresh token available')

        const response = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
        )

        const newAccessToken =
          response.data?.data?.tokens?.accessToken ||
          response.data?.data?.accessToken ||
          response.data?.accessToken

        const newRefreshToken =
          response.data?.data?.tokens?.refreshToken ||
          response.data?.data?.refreshToken ||
          response.data?.refreshToken

        if (!newAccessToken) throw new Error('No access token in refresh response')

        localStorage.setItem('accessToken', newAccessToken)
        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)

        sessionManager.scheduleProactiveRefresh(newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)
        return api(originalRequest)

      } catch (refreshError) {
        processQueue(refreshError, null)
        triggerLogout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api