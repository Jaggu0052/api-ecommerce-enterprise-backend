import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common'

@Catch(UnauthorizedException)
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()

    ctx.getResponse().status(401).json({
      success: false,
      message: exception.message || 'Invalid or expired token',
      error: exception.getResponse(),
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    })
  }
}
