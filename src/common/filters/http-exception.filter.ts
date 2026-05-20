import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { EnterpriseLoggerService } from '../../logs/logger.service'

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter
{
  constructor(
    private readonly logger?: EnterpriseLoggerService,
  ) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()

    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status = this.getStatus(exception)

    const message = this.getMessage(exception)

    void this.logger?.error({
      requestId: request.requestId,
      endpoint: request.originalUrl,
      method: request.method,
      requestBody: request.body,
      ipAddress: request.ip,
      userId: request.user?.id,
      stackTrace: exception.stack,
      message: Array.isArray(message)
        ? message.join(', ')
        : message,
      metadata: {
        status,
      },
    })

    response.status(status).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }

  private getStatus(exception: any) {
    if (exception instanceof HttpException) {
      return exception.getStatus()
    }

    if (
      exception instanceof
      Prisma.PrismaClientKnownRequestError
    ) {
      return HttpStatus.BAD_REQUEST
    }

    return HttpStatus.INTERNAL_SERVER_ERROR
  }

  private getMessage(exception: any) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse()

      if (
        response &&
        typeof response === 'object' &&
        'message' in response
      ) {
        return (response as { message: string | string[] })
          .message
      }
    }

    if (
      exception instanceof
      Prisma.PrismaClientKnownRequestError
    ) {
      return exception.message
    }

    return exception.message || 'Internal server error'
  }
}
