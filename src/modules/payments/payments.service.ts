import { Injectable, Optional } from '@nestjs/common'
import { CrudService } from '../../common/services/crud.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class PaymentsService extends CrudService {
  constructor(@Optional() prisma: PrismaService) {
    super(prisma, {
      model: 'payment',
      searchableFields: ['transactionId'],
      include: { order: true },
    })
  }
}
