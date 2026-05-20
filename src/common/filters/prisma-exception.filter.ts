import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    response.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: exception.message,
      error: {
        code: exception.code,
        meta: exception.meta,
      },
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    })
  }
}
