import { Injectable, Optional } from '@nestjs/common'

import { CrudService } from '../../common/services/crud.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class OrdersService extends CrudService {
  constructor(@Optional() prisma: PrismaService) {
    super(prisma, {
      model: 'order',
      searchableFields: ['orderNumber'],
      include: {
        customer: { include: { user: true } },
        address: true,
        assignedEmployee: { include: { user: true } },
        orderItems: { include: { product: true } },
        payment: true,
        shipment: true,
      },
    })
  }
}
