import { Injectable, Optional } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuditService {
  constructor(@Optional() private readonly prisma: PrismaService) {}

  create(data: {
    userId: string
    action: string
    module: string
    recordId: string
    oldValues?: Prisma.InputJsonValue
    newValues?: Prisma.InputJsonValue
    ipAddress?: string
    userAgent?: string
  }) {
    return this.prisma.auditLog.create({ data })
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      }),
      this.prisma.auditLog.count(),
    ])

    return {
      success: true,
      message: 'Audit logs fetched successfully',
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }
}
