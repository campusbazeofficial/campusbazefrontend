// src/api/apiRetry.js
import api from './api'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

// Exponential backoff
function getRetryDelay(retryCount) {
  return RETRY_DELAY_MS * Math.pow(2, retryCount)
}

// Check if error is retryable
function isRetryableError(error) {
  // Network errors
  if (!error.response) return true
  
  // Server errors (5xx)
  if (error.response.status >= 500 && error.response.status <= 599) return true
  
  // Rate limiting
  if (error.response.status === 429) return true
  
  // Timeout
  if (error.code === 'ECONNABORTED') return true
  
  return false
}

export async function withRetry(apiCall, context = 'api') {
  let lastError = null
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await apiCall()
      return result
    } catch (error) {
      lastError = error
      
      if (!isRetryableError(error)) {
        console.log(`Non-retryable error in ${context}:`, error.message)
        throw error
      }
      
      if (attempt === MAX_RETRIES) {
        console.error(`Max retries (${MAX_RETRIES}) reached for ${context}`)
        throw error
      }
      
      const delay = getRetryDelay(attempt)
      console.log(`Retry ${attempt}/${MAX_RETRIES} for ${context} in ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// HOC for API methods
export function withRetryDecorator(apiMethod, context) {
  return async (...args) => {
    return withRetry(() => apiMethod(...args), context)
  }
}