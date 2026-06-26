export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown[],
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function createErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details || [],
      },
      meta: {
        request_id: getRequestId(),
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    }
  }

  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
    meta: {
      request_id: getRequestId(),
      timestamp: new Date().toISOString(),
      version: 'v1',
    },
  }
}

export function createSuccessResponse<T>(data: T, meta?: Record<string, unknown>) {
  return {
    success: true,
    data,
    meta: {
      request_id: getRequestId(),
      timestamp: new Date().toISOString(),
      version: 'v1',
      ...meta,
    },
  }
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: { cursor?: string; has_more: boolean; total: number; limit: number },
) {
  return {
    success: true,
    data,
    pagination,
    meta: {
      request_id: getRequestId(),
      timestamp: new Date().toISOString(),
      version: 'v1',
    },
  }
}

function getRequestId() {
  try {
    const headers = getRequestHeaders()
    return headers['x-request-id'] || `req_${Date.now()}`
  } catch {
    return `req_${Date.now()}`
  }
}
