import { Injectable, Optional } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AnalyticsService {
  constructor(@Optional() private readonly prisma: PrismaService) {}

  async dashboard() {
    const [
      users,
      customers,
      employees,
      products,
      orders,
      revenue,
    ] = await this.prisma.$transaction([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.customer.count({ where: { deletedAt: null } }),
      this.prisma.employee.count({ where: { deletedAt: null } }),
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.order.count({ where: { deletedAt: null } }),
      this.prisma.payment.aggregate({
        where: { status: 'PAID', deletedAt: null },
        _sum: { amount: true },
      }),
    ])

    return {
      success: true,
      message: 'Analytics fetched successfully',
      data: {
        users,
        customers,
        employees,
        products,
        orders,
        revenue: revenue._sum.amount ?? 0,
      },
    }
  }


  async getDashboardAnalytics() {
    const totalProducts =
      await this.prisma.product.count()

    const totalOrders =
      await this.prisma.order.count()

    const totalCustomers =
      await this.prisma.customer.count()

    const totalEmployees =
      await this.prisma.employee.count()

    const totalRevenue =
      await this.prisma.order.aggregate({
        _sum: {
          total: true,
        },
      })

    return {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalEmployees,
      totalRevenue:
        totalRevenue._sum.total || 0,
    }
  }

  async getRevenueAnalytics() {
    const orders =
      await this.prisma.order.findMany({
        select: {
          total: true,
          createdAt: true,
        },
      })

    const monthlyRevenue: Record<
      string,
      number
    > = {}

    orders.forEach((order) => {
      const month =
        new Date(
          order.createdAt,
        ).toLocaleString('default', {
          month: 'short',
        })

      monthlyRevenue[month] =
        (monthlyRevenue[month] || 0) +
        Number(order.total)
    })

    return Object.entries(
      monthlyRevenue,
    ).map(([month, revenue]) => ({
      month,
      revenue,
    }))
  }

}
