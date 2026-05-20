import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common'

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()

    ctx.getResponse().status(400).json({
      success: false,
      message: 'Validation failed',
      error: exception.getResponse(),
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    })
  }
}
