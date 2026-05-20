import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Optional } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { OrderItemsService } from './order-items.service'

@ApiTags('Order Items')
@ApiBearerAuth()
@Controller('order-items')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderItemsController {
  constructor(@Optional() private readonly service: OrderItemsService) {}
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER') @Post() create(@Body() dto: Record<string, unknown>) { return this.service.create(dto) }
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE') @Get() findAll(@Query() query: PaginationQueryDto) { return this.service.findAll(query) }
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER') @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER') @Patch(':id') update(@Param('id') id: string, @Body() dto: Record<string, unknown>) { return this.service.update(id, dto) }
  @Roles('SUPER_ADMIN', 'ADMIN') @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id) }
}
