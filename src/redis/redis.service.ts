import {
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common'

import { ConfigService } from '@nestjs/config'

import Redis from 'ioredis'


@Injectable()
export class RedisService
  implements OnModuleDestroy
{
  private readonly client: Redis

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.client = new Redis(
      this.configService.get<string>(
        'REDIS_URL',
      )!,
    )

    this.client.on(
      'connect',
      () => {
        console.log(
          '✅ Redis Connected',
        )
      },
    )

    this.client.on(
      'error',
      (error) => {
        console.error(
          error.message,
        )
      },
    )
  }

  async get<T = unknown>(
    key: string,
  ): Promise<T | null> {
    const value =
      await this.client.get(key)

    return value
      ? (value as T)
      : null
  }

  async set(
  key: string,
  value: unknown,
  ttlSeconds = 300,
) {
  await this.client.set(
    key,
    JSON.stringify(value),
    'EX',
    ttlSeconds,
  )
}
  async del(key: string) {
    await this.client.del(key)
  }

  async storeOtp(
    userId: string,
    otp: string,
    ttlSeconds = 300,
  ) {
    await this.set(
      `otp:${userId}`,
      { otp },
      ttlSeconds,
    )
  }

  async getOtp(userId: string) {
    return this.get<{
      otp: string
    }>(`otp:${userId}`)
  }

  async createSession(
    userId: string,
    token: string,
    ttlSeconds = 604800,
  ) {
    await this.set(
      `session:${userId}:${token}`,
      true,
      ttlSeconds,
    )
  }

  async blacklistToken(
    token: string,
    ttlSeconds = 604800,
  ) {
    await this.set(
      `token:blacklist:${token}`,
      true,
      ttlSeconds,
    )
  }

  async isTokenBlacklisted(
    token: string,
  ) {
    return Boolean(
      await this.get(
        `token:blacklist:${token}`,
      ),
    )
  }

  async cacheApiResponse(
    key: string,
    value: unknown,
    ttlSeconds = 60,
  ) {
    await this.set(
      `cache:api:${key}`,
      value,
      ttlSeconds,
    )
  }

  async getCachedApiResponse<
    T = unknown,
  >(key: string) {
    return this.get<T>(
      `cache:api:${key}`,
    )
  }

  async onModuleDestroy() {
    console.log(
      '🔴 Redis Connection Closed',
    )
  }
}