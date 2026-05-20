import { Controller, Get, Query, UseGuards, Optional } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Roles } from '../modules/auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard'
import { RolesGuard } from '../modules/auth/guards/roles.guard'
import { AuditService } from './audit.service'

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(@Optional() private readonly auditService: AuditService) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.auditService.findAll(Number(page), Number(limit))
  }
}
