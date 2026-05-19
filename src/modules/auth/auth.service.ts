import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import * as bcrypt from 'bcrypt'

import { JwtService } from '@nestjs/jwt'

import { PrismaService } from 'src/prisma/prisma.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      })

    if (existingUser) {
      throw new BadRequestException(
        'User already exists',
      )
    }

    const customerRole =
      await this.prisma.role.findFirst({
        where: {
          name: 'CUSTOMER',
        },
      })
      if (!customerRole) {
        throw new BadRequestException(
          'Customer role not found',
        )
      }

    const hashedPassword =
      await bcrypt.hash(dto.password, 10)

    const user =
      await this.prisma.user.create({
        data: {
          name: dto.name,

          email: dto.email,

          phone: dto.phone,

          password: hashedPassword,

          roleId: customerRole.id,
        },

        include: {
          role: true,
        },
      })

    return {
      success: true,
      message:
        'User registered successfully',

      data: user,
    }
  }

  async login(dto: LoginDto) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },

        include: {
          role: true,
        },
      })

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      )
    }

    const isPasswordValid =
      await bcrypt.compare(
        dto.password,
        user.password,
      )

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid credentials',
      )
    }

    const accessToken =
      this.jwtService.sign({
        sub: user.id,

        email: user.email,

        role: user.role.name,
      })

    return {
      success: true,

      accessToken,

      user,
    }
  }
}