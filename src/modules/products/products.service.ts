import { Injectable, Optional } from '@nestjs/common'

import { CrudService } from '../../common/services/crud.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ProductsService extends CrudService {
  constructor(@Optional() prisma: PrismaService) {
    super(prisma, {
      model: 'product',
      searchableFields: ['name', 'sku', 'description'],
      include: {
        category: true,
        inventory: true,
      },
    })
  }
}
