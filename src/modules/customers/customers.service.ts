import { Injectable, Optional } from '@nestjs/common'
import { CrudService } from '../../common/services/crud.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class CustomersService extends CrudService {
  constructor(@Optional() prisma: PrismaService) {
    super(prisma, {
      model: 'customer',
      searchableFields: ['customerCode'],
      include: { user: { include: { role: true } }, addresses: true, subscriptions: true },
    })
  }
}
