import { Injectable, Optional } from '@nestjs/common'
import { CrudService } from '../../common/services/crud.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class InventoryService extends CrudService {
  constructor(@Optional() prisma: PrismaService) {
    super(prisma, {
      model: 'inventory',
      include: { product: true },
      defaultOrderBy: { updatedAt: 'desc' },
    })
  }
}
