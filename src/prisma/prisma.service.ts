import {
  INestApplication,
  Injectable,
  OnModuleInit,
} from '@nestjs/common'

import { PrismaClient } from '@prisma/client'

import { PrismaPg } from '@prisma/adapter-pg'

import { Pool } from 'pg'

import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit
{
  constructor() {
    const sslCert = fs.readFileSync(
      path.join(
        process.cwd(),
        'certs',
        'ca.pem',
      ),
      'utf8',
    )

    const pool = new Pool({
      connectionString:
        process.env.DATABASE_URL,

      ssl: {
        ca: sslCert,

        rejectUnauthorized: true,
      },
    })

    const adapter = new PrismaPg(pool)

    super({
      adapter,
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