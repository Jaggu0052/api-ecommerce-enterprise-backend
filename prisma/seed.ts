import 'dotenv/config'

import { PrismaClient } from '@prisma/client'

import { PrismaPg } from '@prisma/adapter-pg'

import { Pool } from 'pg'

import * as bcrypt from 'bcrypt'

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  let superAdminRole =
    await prisma.role.findFirst({
      where: {
        name: 'SUPER_ADMIN',
      },
    })

  if (!superAdminRole) {
    superAdminRole =
      await prisma.role.create({
        data: {
          name: 'SUPER_ADMIN',

          description:
            'Super Admin Role',
        },
      })
  }

  const hashedPassword =
    await bcrypt.hash('Admin@123', 10)

  const existingAdmin =
    await prisma.user.findUnique({
      where: {
        email:
          'superadmin@gmail.com',
      },
    })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Super Admin',

        email:
          'superadmin@gmail.com',

        password:
          hashedPassword,

        roleId:
          superAdminRole.id,
      },
    })

    console.log(
      '✅ Super Admin Created',
    )
  } else {
    console.log(
      '⚠️ Super Admin Already Exists',
    )
  }
}

main()
  .catch((e) => {
    console.error(e)

    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })