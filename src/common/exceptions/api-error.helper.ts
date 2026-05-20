import { HttpException, HttpStatus } from '@nestjs/common'

export class ApiError {
  static throw(
    message: string,
    status = HttpStatus.BAD_REQUEST,
    error?: unknown,
  ): never {
    throw new HttpException(
      {
        success: false,
        message,
        error: error ?? null,
      },
      status,
    )
  }
}
