import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Optional } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { SubscriptionsService } from './subscriptions.service'

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(@Optional() private readonly service: SubscriptionsService) {}
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER') @Post() create(@Body() dto: Record<string, unknown>) { return this.service.create(dto) }
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER') @Get() findAll(@Query() query: PaginationQueryDto) { return this.service.findAll(query) }
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER') @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
  @Roles('SUPER_ADMIN', 'ADMIN') @Patch(':id') update(@Param('id') id: string, @Body() dto: Record<string, unknown>) { return this.service.update(id, dto) }
  @Roles('SUPER_ADMIN') @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id) }
}
