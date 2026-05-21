import { Injectable, Optional } from '@nestjs/common'
import { LogType, Prisma } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as winston from 'winston'

import { PrismaService } from '../prisma/prisma.service'

export interface EnterpriseLogPayload {
  requestId?: string
  type: LogType
  endpoint?: string
  method?: string
  requestBody?: Prisma.InputJsonValue
  responseBody?: Prisma.InputJsonValue
  message: string
  stackTrace?: string
  userId?: string
  ipAddress?: string
  executionTime?: number
  metadata?: Prisma.InputJsonValue
}

@Injectable()
export class EnterpriseLoggerService {
  private readonly logger: winston.Logger

  constructor(
    @Optional() private readonly prisma?: PrismaService,
  ) {
    this.ensureLogDirs()

    const format = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    )

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL ?? 'info',
      format,
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs/application/application.log',
        }),
        new winston.transports.File({
          filename: 'logs/errors/error.log',
          level: 'error',
        }),
      ],
    })
  }

  async log(payload: EnterpriseLogPayload) {
    const level =
      payload.type === 'ERROR' || payload.type === 'SECURITY'
        ? 'error'
        : 'info'

    this.logger.log(level, payload.message, payload)
    this.writeTypeFile(payload)

    if (this.prisma?.logEntry) {
      await this.prisma.logEntry
        .create({ data: payload })
        .catch(() => undefined)
    }
  }

  request(payload: Omit<EnterpriseLogPayload, 'type'>) {
    return this.log({ ...payload, type: 'REQUEST' })
  }

  response(payload: Omit<EnterpriseLogPayload, 'type'>) {
    return this.log({ ...payload, type: 'RESPONSE' })
  }

  error(payload: Omit<EnterpriseLogPayload, 'type'>) {
    return this.log({ ...payload, type: 'ERROR' })
  }

  prismaLog(payload: Omit<EnterpriseLogPayload, 'type'>) {
    return this.log({ ...payload, type: 'PRISMA' })
  }

  auth(payload: Omit<EnterpriseLogPayload, 'type'>) {
    return this.log({ ...payload, type: 'AUTH' })
  }

  audit(payload: Omit<EnterpriseLogPayload, 'type'>) {
    return this.log({ ...payload, type: 'AUDIT' })
  }

  security(payload: Omit<EnterpriseLogPayload, 'type'>) {
    return this.log({ ...payload, type: 'SECURITY' })
  }

  async findByType(type: LogType, page = 1, limit = 50) {
    const skip = (page - 1) * limit

    if (!this.prisma?.logEntry) {
      return {
        success: true,
        message: `${type} logs fetched successfully`,
        data: [],
        meta: { page, limit, total: 0, totalPages: 0 },
      }
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.logEntry.findMany({
        where: { type },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.logEntry.count({ where: { type } }),
    ])

    return {
      success: true,
      message: `${type} logs fetched successfully`,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  private ensureLogDirs() {
    const dirs = [
      'logs/application',
      'logs/errors',
      'logs/requests',
      'logs/responses',
      'logs/prisma',
      'logs/auth',
      'logs/audit',
      'logs/security',
    ]

    dirs.forEach((dir) =>
      fs.mkdirSync(dir, { recursive: true }),
    )
  }

  private writeTypeFile(payload: EnterpriseLogPayload) {
    const folder = this.folderFor(payload.type)
    const filePath = path.join(
      folder,
      `${new Date().toISOString().slice(0, 10)}.log`,
    )

    fs.appendFile(
      filePath,
      `${JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      })}\n`,
      () => undefined,
    )
  }

  private folderFor(type: LogType) {
    const folders: Record<LogType, string> = {
      REQUEST: 'logs/requests',
      RESPONSE: 'logs/responses',
      ERROR: 'logs/errors',
      PRISMA: 'logs/prisma',
      AUTH: 'logs/auth',
      AUDIT: 'logs/audit',
      SECURITY: 'logs/security',
      PERFORMANCE: 'logs/application',
    }

    return folders[type] ?? 'logs/application'
  }
}
