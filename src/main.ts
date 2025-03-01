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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Routes');

  // Enable CORS
  app.enableCors();

  // Global validation pipe with error handling
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('SUGRiA Movement API')
    .setDescription('API for joining the SUGRiA movement')
    .setVersion('1.0')
    .addTag('members')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

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

  await app.listen(process.env.PORT || 5001);
  console.log(`Application is running on: http://localhost:${process.env.PORT || 5001}`);
  console.log(`Swagger documentation: http://localhost:${process.env.PORT || 5001}/api`);
}
bootstrap();
