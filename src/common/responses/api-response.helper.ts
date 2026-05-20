export class ApiResponse {
  static success<T>(
    message: string,
    data?: T,
    meta?: Record<string, unknown>,
  ) {
    return {
      success: true,
      message,
      data: data ?? null,
      ...(meta ? { meta } : {}),
    }
  }

  static error(
    message: string,
    error?: unknown,
  ) {
    return {
      success: false,
      message,
      error: error ?? null,
    }
  }
}
