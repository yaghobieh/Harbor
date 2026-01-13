import { ApiResponse } from '../types';

/**
 * Format a success response
 */
export function formatResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Format an error response
 */
export function formatError(error: string, message?: string): ApiResponse {
  return {
    success: false,
    error,
    message,
  };
}

