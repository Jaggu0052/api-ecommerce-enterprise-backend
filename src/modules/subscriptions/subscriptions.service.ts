import { Injectable, Optional } from '@nestjs/common'
import { CrudService } from '../../common/services/crud.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class SubscriptionsService extends CrudService {
  constructor(@Optional() prisma: PrismaService) {
    super(prisma, {
      model: 'subscription',
      include: { customer: { include: { user: true } }, plan: true },
    })
  }
}
