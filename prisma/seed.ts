import 'dotenv/config'

import { faker } from '@faker-js/faker'

import {
  PrismaClient,
  PaymentStatus,
  NotificationType,
  User,
} from '@prisma/client'

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
  console.log(
    '🚀 Database Seeding Started...',
  )

  // ======================================================
  // ROLES
  // ======================================================

  await prisma.role.createMany({
    data: [
      {
        name: 'SUPER_ADMIN',
        description:
          'Super Admin',
      },
      {
        name: 'ADMIN',
        description: 'Admin',
      },
      {
        name: 'MANAGER',
        description: 'Manager',
      },
      {
        name: 'EMPLOYEE',
        description:
          'Employee',
      },
      {
        name: 'CUSTOMER',
        description:
          'Customer',
      },
    ],

    skipDuplicates: true,
  })

  console.log('✅ Roles Created')

  // ======================================================
  // DEPARTMENTS
  // ======================================================

  await prisma.department.createMany({
    data: [
      {
        name: 'IT',
      },
      {
        name: 'HR',
      },
      {
        name: 'Sales',
      },
      {
        name: 'Marketing',
      },
    ],

    skipDuplicates: true,
  })

  console.log(
    '✅ Departments Created',
  )

  // ======================================================
  // DESIGNATIONS
  // ======================================================

  await prisma.designation.createMany(
    {
      data: [
        {
          name:
            'Software Engineer',
        },
        {
          name: 'Manager',
        },
        {
          name:
            'HR Executive',
        },
      ],

      skipDuplicates: true,
    },
  )

  console.log(
    '✅ Designations Created',
  )

  // ======================================================
  // CATEGORIES
  // ======================================================

  const categories: {
    name: string
    description: string
  }[] = []

  for (let i = 0; i < 10; i++) {
    categories.push({
      name:
        faker.commerce.department(),

      description:
        faker.commerce.productDescription(),
    })
  }

  await prisma.category.createMany({
    data: categories,
  })

  console.log(
    '✅ Categories Created',
  )

  // ======================================================
  // FETCH MASTER DATA
  // ======================================================

  const customerRole =
    await prisma.role.findFirst({
      where: {
        name: 'CUSTOMER',
      },
    })

  const employeeRole =
    await prisma.role.findFirst({
      where: {
        name: 'EMPLOYEE',
      },
    })

  const adminRole =
    await prisma.role.findFirst({
      where: {
        name: 'ADMIN',
      },
    })

  const allDepartments =
    await prisma.department.findMany()

  const allDesignations =
    await prisma.designation.findMany()

  const allCategories =
    await prisma.category.findMany()

  // ======================================================
  // ADMIN USER
  // ======================================================

  const adminExists =
    await prisma.user.findUnique({
      where: {
        email:
          'admin@gmail.com',
      },
    })

  if (!adminExists && adminRole) {
    const hashedPassword =
      await bcrypt.hash(
        'Admin@123',
        10,
      )

    await prisma.user.create({
      data: {
        name: 'Admin',

        email:
          'admin@gmail.com',

        password:
          hashedPassword,

        phone:
          '9999999999',

        roleId:
          adminRole.id,
      },
    })
  }

  console.log('✅ Admin Created')

  // ======================================================
  // PRODUCTS
  // ======================================================

  for (let i = 0; i < 100; i++) {
    const randomCategory =
      faker.helpers.arrayElement(
        allCategories,
      )

    await prisma.product.create({
      data: {
        name:
          faker.commerce.productName(),

        description:
          faker.commerce.productDescription(),

        price: Number(
          faker.commerce.price({
            min: 100,
            max: 100000,
          }),
        ),

        stock:
          faker.number.int({
            min: 1,
            max: 500,
          }),

        sku:
          faker.string.alphanumeric(
            10,
          ),

        categoryId:
          randomCategory.id,
      },
    })
  }

  console.log(
    '✅ Products Created',
  )

  // ======================================================
  // CUSTOMERS
  // ======================================================

  const customerUsers: User[] = []

  for (let i = 0; i < 20; i++) {
    if (!customerRole) continue

    const hashedPassword =
      await bcrypt.hash(
        'Customer@123',
        10,
      )

    const user =
      await prisma.user.create({
        data: {
          name:
            faker.person.fullName(),

          email:
            faker.internet.email(),

          password:
            hashedPassword,

          phone:
            faker.phone.number(),

          roleId:
            customerRole.id,
        },
      })

    customerUsers.push(user)

    const customer =
      await prisma.customer.create({
        data: {
          userId: user.id,

          customerCode: `CUS-${1000 + i
            }`,
        },
      })

    await prisma.customerAddress.create({
      data: {
        customerId:
          customer.id,

        type: 'HOME',

        name: user.name,

        phone:
          user.phone || '9999999999',

        addressLine1:
          faker.location.streetAddress(),

        addressLine2:
          faker.location.secondaryAddress(),

        city:
          faker.location.city(),

        state:
          faker.location.state(),

        pincode:
          faker.location.zipCode(),

        country: 'India',

        isDefault: true,
      },
    })
  }

  console.log(
    '✅ Customers Created',
  )

  // ======================================================
  // EMPLOYEES
  // ======================================================

  for (let i = 0; i < 10; i++) {
    if (!employeeRole) continue

    const hashedPassword =
      await bcrypt.hash(
        'Employee@123',
        10,
      )

    const user =
      await prisma.user.create({
        data: {
          name:
            faker.person.fullName(),

          email:
            faker.internet.email(),

          password:
            hashedPassword,

          phone:
            faker.phone.number(),

          roleId:
            employeeRole.id,
        },
      })

    const department =
      faker.helpers.arrayElement(
        allDepartments,
      )

    const designation =
      faker.helpers.arrayElement(
        allDesignations,
      )

    await prisma.employee.create({
      data: {
        userId: user.id,

        employeeCode: `EMP-${1000 + i
          }`,

        joiningDate:
          faker.date.past(),

        status: 'ACTIVE',

        departmentId:
          department.id,

        designationId:
          designation.id,

        salary: 50000,
      },
    })
  }

  console.log(
    '✅ Employees Created',
  )

  // ======================================================
  // FETCH PRODUCTS
  // ======================================================

  const allProducts =
    await prisma.product.findMany()

  // ======================================================
  // ORDERS + PAYMENTS
  // ======================================================

  for (const customerUser of customerUsers) {
    const customer =
      await prisma.customer.findFirst({
        where: {
          userId:
            customerUser.id,
        },
      })

    if (!customer) continue

    const customerAddress =
      await prisma.customerAddress.findFirst(
        {
          where: {
            customerId:
              customer.id,
          },
        },
      )

    if (!customerAddress)
      continue

    const total =
      faker.number.int({
        min: 1000,
        max: 100000,
      })

    const order =
      await prisma.order.create({
        data: {
          customerId:
            customer.id,

          addressId:
            customerAddress.id,

          orderNumber:
            faker.string.uuid(),

          subtotal: total,

          total,

          shippingCharges: 100,

          discount: 50,

          paymentStatus:
            PaymentStatus.PAID,
        },
      })

    for (let i = 0; i < 3; i++) {
      const randomProduct =
        faker.helpers.arrayElement(
          allProducts,
        )

      await prisma.orderItem.create({
        data: {
          orderId: order.id,

          productId:
            randomProduct.id,

          quantity:
            faker.number.int({
              min: 1,
              max: 5,
            }),

          price:
            randomProduct.price,

          total:
            Number(
              randomProduct.price,
            ) * 2,
        },
      })
    }

    await prisma.payment.create({
      data: {
        orderId: order.id,

        amount: total,

        transactionId:
          faker.string.uuid(),

        method: 'UPI',

        status:
          PaymentStatus.PAID,
      },
    })
  }

  console.log(
    '✅ Orders & Payments Created',
  )

  // ======================================================
  // NOTIFICATIONS
  // ======================================================

  const users =
    await prisma.user.findMany()

  for (const user of users) {
    for (let i = 0; i < 5; i++) {
      await prisma.notification.create({
        data: {
          userId: user.id,

          title:
            faker.lorem.words(3),

          message:
            faker.lorem.paragraph(),

          type:
            NotificationType.IN_APP,

          channel:
            NotificationType.IN_APP,
        },
      })
    }
  }

  console.log(
    '✅ Notifications Created',
  )

  console.log(
    '🎉 Database Seeding Completed Successfully',
  )
}

main()
  .catch((e) => {
    console.error(e)

    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })