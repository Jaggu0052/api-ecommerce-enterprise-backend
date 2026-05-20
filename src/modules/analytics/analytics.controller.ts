import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common'

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

import { AnalyticsService } from './analytics.service'

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get()
  async getAnalytics() {
    try {
      const data =
        await this.analyticsService.getDashboardAnalytics()

      return {
        success: true,
        message:
          'Analytics fetched successfully',
        data,
      }
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          'Failed to fetch analytics',
      }
    }
  }

  @Get('revenue')
  async getRevenueAnalytics() {
    try {
      const data =
        await this.analyticsService.getRevenueAnalytics()

      return {
        success: true,
        message:
          'Revenue analytics fetched successfully',
        data,
      }
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          'Failed to fetch revenue analytics',
      }
    }
  }
}