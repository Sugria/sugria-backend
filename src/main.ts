import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RoutesService } from './routes.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PrismaService } from './prisma/prisma.service';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'], // Reduce logging in production
  });
  const logger = new Logger('Routes');

  // Security
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe with error handling
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation (only in development)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('SUGRiA API')
      .setDescription('The SUGRiA Movement API documentation')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  // Serve static files in development
  if (process.env.NODE_ENV === 'development') {
    app.useStaticAssets(join(__dirname, '..', 'public'), {
      prefix: '/',
    });
  }

  // Log all routes after initialization
  const routesService = app.get(RoutesService);
  const routes = routesService.getRoutes();
  
  logger.log('\nAvailable Routes:');
  logger.log('================');
  routes.forEach(route => {
    logger.log(`${route.method} ${route.path}`);
  });
  logger.log('================\n');

  // Test database connection
  const prismaService = app.get(PrismaService);
  try {
    await prismaService.$connect();
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  const port = process.env.PORT || 5001;
  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation: ${await app.getUrl()}/api`);
}
bootstrap();
