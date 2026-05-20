import { Injectable, Optional } from '@nestjs/common'
import { CrudService } from '../../common/services/crud.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AttendanceService extends CrudService {
  constructor(@Optional() prisma: PrismaService) {
    super(prisma, {
      model: 'attendance',
      include: { employee: { include: { user: true } } },
    })
  }
}
