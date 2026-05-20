import { Module } from '@nestjs/common'

import { LogsController } from './logs.controller'
import { EnterpriseLoggerService } from './logger.service'
import { RequestLoggerMiddleware } from './request-logger.middleware'

@Module({
  controllers: [LogsController],
  providers: [EnterpriseLoggerService, RequestLoggerMiddleware],
  exports: [EnterpriseLoggerService, RequestLoggerMiddleware],
})
export class LoggerModule {}
