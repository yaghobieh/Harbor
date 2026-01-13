export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const HTTP_MESSAGES = {
  [HTTP_STATUS.OK]: 'Success',
  [HTTP_STATUS.CREATED]: 'Created successfully',
  [HTTP_STATUS.NO_CONTENT]: 'Deleted successfully',
  [HTTP_STATUS.BAD_REQUEST]: 'Bad request',
  [HTTP_STATUS.UNAUTHORIZED]: 'Unauthorized',
  [HTTP_STATUS.FORBIDDEN]: 'Access denied',
  [HTTP_STATUS.NOT_FOUND]: 'Resource not found',
  [HTTP_STATUS.CONFLICT]: 'Resource already exists',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Validation error',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too many requests',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [HTTP_STATUS.BAD_GATEWAY]: 'Bad gateway',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service unavailable',
} as const;

