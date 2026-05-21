import {
  Injectable,
  NestMiddleware,
  Optional,
} from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { randomUUID } from 'crypto'

import { EnterpriseLoggerService } from './logger.service'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(
    @Optional()
    private readonly logger?: EnterpriseLoggerService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startedAt = Date.now()
    const requestId =
      req.headers['x-request-id']?.toString() ?? randomUUID()

    ;(req as any).requestId = requestId
    res.setHeader('x-request-id', requestId)

    void this.logger?.request({
      requestId,
      endpoint: req.originalUrl,
      method: req.method,
      requestBody: req.body,
      ipAddress: req.ip,
      userId: (req as any).user?.id,
      message: 'Incoming request',
    })

    res.on('finish', () => {
      void this.logger?.response({
        requestId,
        endpoint: req.originalUrl,
        method: req.method,
        ipAddress: req.ip,
        userId: (req as any).user?.id,
        executionTime: Date.now() - startedAt,
        responseBody: {
          statusCode: res.statusCode,
        },
        message: 'Outgoing response',
      })
    })

    next()
  }
}
