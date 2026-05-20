import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { Messages } from '../constants/messages.constants'
import { PaginationQueryDto } from '../dto/pagination-query.dto'
import { PrismaService } from '../../prisma/prisma.service'

export interface CrudOptions {
  model: string
  searchableFields?: string[]
  include?: Record<string, unknown>
  defaultOrderBy?: Record<string, 'asc' | 'desc'>
}

@Injectable()
export class CrudService {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly options: CrudOptions,
  ) {}

  protected get delegate(): any {
    const delegate = (this.prisma as any)[this.options.model]

    if (!delegate) {
      throw new BadRequestException(
        `Unknown Prisma model: ${this.options.model}`,
      )
    }

    return delegate
  }

  async create(data: Record<string, unknown>) {
    const record = await this.delegate.create({
      data,
      include: this.options.include,
    })

    return {
      success: true,
      message: Messages.CREATED,
      data: record,
    }
  }

  async findAll(query: PaginationQueryDto = {}) {
    const page = Number(query.page ?? 1)
    const limit = Number(query.limit ?? 10)
    const skip = (page - 1) * limit
    const where = this.buildWhere(query)
    const orderBy =
      query.sortBy && query.sortOrder
        ? { [query.sortBy]: query.sortOrder }
        : (this.options.defaultOrderBy ?? { createdAt: 'desc' })

    const [items, total] = await this.prisma.$transaction([
      this.delegate.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: this.options.include,
      }),
      this.delegate.count({ where }),
    ])

    return {
      success: true,
      message: Messages.LISTED,
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string) {
    const record = await this.delegate.findFirst({
      where: this.withNotDeleted({ id }),
      include: this.options.include,
    })

    if (!record) {
      throw new NotFoundException(Messages.NOT_FOUND)
    }

    return {
      success: true,
      message: Messages.FETCHED,
      data: record,
    }
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.findOne(id)

    const record = await this.delegate.update({
      where: { id },
      data,
      include: this.options.include,
    })

    return {
      success: true,
      message: Messages.UPDATED,
      data: record,
    }
  }

  async remove(id: string) {
    await this.findOne(id)

    const record = await this.delegate.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return {
      success: true,
      message: Messages.DELETED,
      data: record,
    }
  }

  private buildWhere(query: PaginationQueryDto) {
    const filters: Record<string, unknown>[] = []

    if (query.status) {
      filters.push({ status: query.status })
    }

    if (query.search && this.options.searchableFields?.length) {
      filters.push({
        OR: this.options.searchableFields.map((field) => ({
          [field]: {
            contains: query.search,
            mode: 'insensitive',
          },
        })),
      })
    }

    return this.withNotDeleted(
      filters.length ? { AND: filters } : {},
    )
  }

  private withNotDeleted(where: Record<string, unknown>) {
    return {
      ...where,
      deletedAt: null,
    }
  }
}
