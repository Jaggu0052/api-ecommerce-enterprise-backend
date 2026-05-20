import { Injectable, Optional } from '@nestjs/common'
import { CrudService } from '../../common/services/crud.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class EmployeesService extends CrudService {
  constructor(@Optional() prisma: PrismaService) {
    super(prisma, {
      model: 'employee',
      searchableFields: ['employeeCode'],
      include: { user: { include: { role: true } }, department: true, designation: true, manager: true },
    })
  }
}
