import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Optional,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { Roles } from '../modules/auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard'
import { RolesGuard } from '../modules/auth/guards/roles.guard'
import { EnterpriseLoggerService } from './logger.service'

@ApiTags('Logs')
@ApiBearerAuth()
@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogsController {
  constructor(
    @Optional()
    private readonly loggerService: EnterpriseLoggerService,
  ) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('errors')
  async errors(@Query('page') page = '1') {
    try {
      return await this.loggerService.findByType(
        'ERROR',
        Number(page),
      )
    } catch (error) {
      throw this.toHttpException(error)
    }
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('requests')
  async requests(@Query('page') page = '1') {
    try {
      return await this.loggerService.findByType(
        'REQUEST',
        Number(page),
      )
    } catch (error) {
      throw this.toHttpException(error)
    }
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('security')
  async security(@Query('page') page = '1') {
    try {
      return await this.loggerService.findByType(
        'SECURITY',
        Number(page),
      )
    } catch (error) {
      throw this.toHttpException(error)
    }
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('audit')
  async audit(@Query('page') page = '1') {
    try {
      return await this.loggerService.findByType(
        'AUDIT',
        Number(page),
      )
    } catch (error) {
      throw this.toHttpException(error)
    }
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('prisma')
  async prisma(@Query('page') page = '1') {
    try {
      return await this.loggerService.findByType(
        'PRISMA',
        Number(page),
      )
    } catch (error) {
      throw this.toHttpException(error)
    }
  }

  private toHttpException(error: any) {
    return new HttpException(
      {
        success: false,
        message:
          error.message || 'Failed to fetch logs',
        error,
      },
      HttpStatus.BAD_REQUEST,
    )
  }
}
