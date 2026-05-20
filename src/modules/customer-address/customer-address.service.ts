import { Injectable, Optional } from '@nestjs/common'
import { CrudService } from '../../common/services/crud.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class CustomerAddressService extends CrudService {
  constructor(@Optional() prisma: PrismaService) {
    super(prisma, {
      model: 'customerAddress',
      searchableFields: ['name', 'phone', 'city', 'state', 'country', 'pincode'],
      include: { customer: { include: { user: true } } },
    })
  }
}
