import { Injectable, Optional } from '@nestjs/common'

import { CrudService } from '../../common/services/crud.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class CategoriesService extends CrudService {
  constructor(@Optional() prisma: PrismaService) {
    super(prisma, {
      model: 'category',
      searchableFields: ['name', 'description'],
      include: {
        parent: true,
        children: true,
      },
    })
  }
}
