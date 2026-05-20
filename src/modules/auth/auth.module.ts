import { Module } from '@nestjs/common'

import { JwtModule } from '@nestjs/jwt'

import { PassportModule } from '@nestjs/passport'

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config'

import { PrismaModule } from 'src/prisma/prisma.module'

import { RedisModule } from '../../redis/redis.module'

import { LoggerModule } from '../../logs-temp/logger.module'

import { AuthController } from './auth.controller'

import { AuthService } from './auth.service'

import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    LoggerModule,

    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (
        configService: ConfigService,
      ) => ({
        secret:
          configService.get<string>(
            'JWT_SECRET',
          ),

        signOptions: {
          expiresIn:
            (configService.get<string>(
              'JWT_EXPIRES_IN',
            ) || '7d') as any,
        },
      }),
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
  ],

  exports: [AuthService],
})
export class AuthModule { }