import {
  BadRequestException,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common'

import * as bcrypt from 'bcrypt'

import { JwtService } from '@nestjs/jwt'

import { PrismaService } from 'src/prisma/prisma.service'
import { RedisService } from '../../redis/redis.service'
import { EnterpriseLoggerService } from '../../logs-temp/logger.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    @Optional() private readonly prisma: PrismaService,

    @Optional() private readonly jwtService: JwtService,

    @Optional() private readonly redisService?: RedisService,

    @Optional() private readonly logger?: EnterpriseLoggerService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      })

    if (existingUser && !existingUser.deletedAt) {
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

    const { password, ...safeUser } = user

    return {
      success: true,
      message:
        'User registered successfully',

      data: safeUser,
    }
  }

  async login(dto: LoginDto) {
    console.log(
    'JWT_SECRET:',
    process.env.JWT_SECRET,
  )

  const token = this.jwtService.sign({
  test: true,
})


    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },

        include: {
          role: true,
        },
      })

    if (!user || user.deletedAt || user.status !== 'ACTIVE') {
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
    const refreshToken =
      this.jwtService.sign(
        {
          sub: user.id,
          type: 'refresh',
        },
        {
          expiresIn: '30d',
        },
      )

    try {
      await this.redisService?.createSession(
        user.id,
        refreshToken,
        60 * 60 * 24 * 30,
      )
    } catch (error) {
      void this.logger?.auth({
        userId: user.id,
        message: 'Redis session create failed',
        metadata: {
          email: user.email,
          role: user.role.name,
          error: error?.message ?? error,
        },
      })
    }

    void this.logger?.auth({
      userId: user.id,
      message: 'User login successful',
      metadata: {
        email: user.email,
        role: user.role.name,
      },
    })

    const { password, ...safeUser } = user

    return {
      success: true,
      message: 'Login successful',

      data: {
        token :accessToken,
        refreshToken : refreshToken,
        user: safeUser,
      },
    }
  }

  async refreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken)

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const isBlacklisted =
      await this.redisService?.isTokenBlacklisted(refreshToken)

    if (isBlacklisted) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    })

    if (!user || user.deletedAt || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    })

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: { accessToken },
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user || user.deletedAt) {
      return {
        success: true,
        message:
          'If the email exists, an OTP has been sent',
        data: null,
      }
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000,
    ).toString()

    await this.redisService?.storeOtp(user.id, otp)

    return {
      success: true,
      message: 'Password reset OTP generated successfully',
      data: {
        userId: user.id,
        otpDeliveryReady: true,
      },
    }
  }

  async resetPassword(
    userId: string,
    otp: string,
    password: string,
  ) {
    const storedOtp = await this.redisService?.getOtp(userId)

    if (!storedOtp || storedOtp.otp !== otp) {
      throw new BadRequestException('Invalid or expired OTP')
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: await bcrypt.hash(password, 10),
      },
    })

    await this.redisService?.del(`otp:${userId}`)

    return {
      success: true,
      message: 'Password reset successfully',
      data: null,
    }
  }
}
