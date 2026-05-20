import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Optional } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { OtpVerificationService } from './otp-verification.service'

@ApiTags('OTP Verification')
@ApiBearerAuth()
@Controller('otp-verifications')
export class OtpVerificationController {
  constructor(@Optional() private readonly service: OtpVerificationService) {}
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPER_ADMIN', 'ADMIN') @Post() create(@Body() dto: Record<string, unknown>) { return this.service.create(dto) }
  @Post('issue') issue(@Body() dto: { userId: string; type: string; otp: string; expiresAt: string }) { return this.service.issue(dto) }
  @Post(':id/verify') verify(@Param('id') id: string, @Body('otp') otp: string) { return this.service.verify(id, otp) }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPER_ADMIN', 'ADMIN') @Get() findAll(@Query() query: PaginationQueryDto) { return this.service.findAll(query) }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPER_ADMIN', 'ADMIN') @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id) }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPER_ADMIN', 'ADMIN') @Patch(':id') update(@Param('id') id: string, @Body() dto: Record<string, unknown>) { return this.service.update(id, dto) }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SUPER_ADMIN') @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id) }
}
