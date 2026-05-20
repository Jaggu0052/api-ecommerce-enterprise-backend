import {
  INestApplication,
  Injectable,
  OnModuleInit,
} from '@nestjs/common'

import { PrismaClient } from '@prisma/client'

import { PrismaPg } from '@prisma/adapter-pg'

import { Pool } from 'pg'
import * as fs from 'fs'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit
{
  constructor() {
    const pool = new Pool({
      connectionString:
        process.env.DATABASE_URL,

      ssl: {
        rejectUnauthorized: false,
      },
    })

    const adapter = new PrismaPg(pool)

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    })

    this.$on('query' as never, (event: any) => {
      fs.mkdirSync('logs/prisma', { recursive: true })
      fs.appendFile(
        'logs/prisma/query.log',
        `${JSON.stringify({
          query: event.query,
          params: event.params,
          duration: event.duration,
          timestamp: event.timestamp,
        })}\n`,
        () => undefined,
      )
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async enableShutdownHooks(
    app: INestApplication,
  ) {
    process.on(
      'beforeExit',
      async () => {
        await app.close()
      },
    )
  }
}
