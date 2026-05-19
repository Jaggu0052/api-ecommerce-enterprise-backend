import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'

import { CurrentUser } from './decorators/current-user.decorator'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

import { JwtAuthGuard } from './guards/jwt-auth.guard'

import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
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

  @UseGuards(JwtAuthGuard)
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
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}