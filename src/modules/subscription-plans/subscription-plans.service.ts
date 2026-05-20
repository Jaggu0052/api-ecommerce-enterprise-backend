import { Injectable, Optional } from '@nestjs/common'
import { CrudService } from '../../common/services/crud.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class SubscriptionPlansService extends CrudService {
  constructor(@Optional() prisma: PrismaService) {
    super(prisma, {
      model: 'subscriptionPlan',
      searchableFields: ['name', 'description'],
      include: { subscriptions: true },
    })
  }
}
