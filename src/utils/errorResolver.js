// src/utils/errorResolver.js
import { ERROR_MESSAGES } from '@/constants/errorMessages';

export function resolveError(error) {
  // Axios-style error shape
  if (error?.response) {
    const status = error.response.status;

    switch (status) {
      case 400:
        return error.response.data?.message || ERROR_MESSAGES.unknown;

      case 401:
        return ERROR_MESSAGES.unauthorized;

      case 403:
        return ERROR_MESSAGES.forbidden;

      case 404:
        return ERROR_MESSAGES.notFound;

      case 500:
      default:
        return ERROR_MESSAGES.server;
    }
  }

  // Network failure (no response)
  if (error?.request) {
    return ERROR_MESSAGES.network;
  }

  // Generic JS error
  return error?.message || ERROR_MESSAGES.unknown;
}