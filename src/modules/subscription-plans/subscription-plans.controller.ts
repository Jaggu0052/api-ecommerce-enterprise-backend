import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Optional } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { SubscriptionPlansService } from './subscription-plans.service'

@ApiTags('Subscription Plans')
@ApiBearerAuth()
@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(@Optional() private readonly service: SubscriptionPlansService) {}
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPER_ADMIN', 'ADMIN') @Post() create(@Body() dto: Record<string, unknown>) { return this.service.create(dto) }
  @Get() findAll(@Query() query: PaginationQueryDto) { return this.service.findAll(query) }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPER_ADMIN', 'ADMIN') @Patch(':id') update(@Param('id') id: string, @Body() dto: Record<string, unknown>) { return this.service.update(id, dto) }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPER_ADMIN') @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id) }
}
