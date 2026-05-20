import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { EnterpriseLoggerService } from './logs/logger.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(EnterpriseLoggerService)

  app.use(helmet())
  app.enableCors({
  origin: true,
  credentials: true,
})
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter(logger))
  app.useGlobalInterceptors(new ResponseInterceptor())

  const config = new DocumentBuilder()
    .setTitle('Enterprise E-Commerce Workforce API')
    .setDescription(
      'Production-ready NestJS backend with Prisma, PostgreSQL, Redis, JWT, RBAC, and Swagger.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
