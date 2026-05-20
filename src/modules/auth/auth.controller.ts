import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Optional,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { CurrentUser } from './decorators/current-user.decorator'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

import { JwtAuthGuard } from './guards/jwt-auth.guard'

import { AuthService } from './auth.service'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Optional() private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
  ) {
    try {
      return await this.authService.register(
        dto,
      )
    } catch (error) {
      throw new HttpException(
        {
          success: false,

          message:
            error.message ||
            'Failed to register user',
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
  ) {
    try {
      return await this.authService.login(
        dto,
      )
    } catch (error) {
      throw new HttpException(
        {
          success: false,

          message:
            error.message ||
            'Failed to login',
        },
        HttpStatus.UNAUTHORIZED,
      )
    }
  }

  @Post('refresh-token')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ) {
    try {
      return await this.authService.refreshToken(
        refreshToken,
      )
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ||
            'Failed to refresh token',
          error,
        },
        HttpStatus.UNAUTHORIZED,
      )
    }
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body('email') email: string,
  ) {
    try {
      return await this.authService.forgotPassword(
        email,
      )
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ||
            'Failed to start password reset',
          error,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Post('reset-password')
  async resetPassword(
    @Body('userId') userId: string,
    @Body('otp') otp: string,
    @Body('password') password: string,
  ) {
    try {
      return await this.authService.resetPassword(
        userId,
        otp,
        password,
      )
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ||
            'Failed to reset password',
          error,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async me(
    @CurrentUser() user: any,
  ) {
    try {
      return {
        success: true,

        data: user,
      }
    } catch (error) {
      throw new HttpException(
        {
          success: false,

          message:
            error.message ||
            'Failed to fetch user profile',
          error,
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
