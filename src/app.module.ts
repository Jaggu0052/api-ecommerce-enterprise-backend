import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { SalariesModule } from './modules/salaries/salaries.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuditModule } from './audit/audit.module';
import { RolesModule } from './modules/roles/roles.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrderItemsModule } from './modules/order-items/order-items.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { SubscriptionPlansModule } from './modules/subscription-plans/subscription-plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { OtpVerificationModule } from './modules/otp-verification/otp-verification.module';
import { CustomerAddressModule } from './modules/customer-address/customer-address.module';
import { LoggerModule } from './logs/logger.module';
import { RequestLoggerMiddleware } from './logs/request-logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true,
  }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    LoggerModule, AuthModule, UsersModule, EmployeesModule, AttendanceModule, SalariesModule, CustomersModule, CustomerAddressModule, ProductsModule, CategoriesModule, InventoryModule, OrdersModule, OrderItemsModule, PaymentsModule, ShipmentsModule, NotificationsModule, SubscriptionPlansModule, SubscriptionsModule, OtpVerificationModule, AnalyticsModule, PrismaModule, RedisModule, AuditModule, RolesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes({
      path: '*path',
      method: RequestMethod.ALL,
    })
  }
}
