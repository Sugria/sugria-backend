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
  app.use(helmet({
    crossOriginResourcePolicy: { 
      policy: 'cross-origin' 
    },
    crossOriginOpenerPolicy: { 
      policy: 'same-origin-allow-popups' 
    }
  }));
  app.use(compression());

  // CORS Configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',     // Local development
      'http://localhost:3001',     // Alternative local development
      'https://sugria.com',        // Production frontend
      'https://www.sugria.com',    // Production frontend with www
      'https://dev.sugria.com'     // Development/staging frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Credentials'
    ],
    exposedHeaders: ['Content-Disposition'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
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

  app.useStaticAssets(join(__dirname, '..', 'email/templates'));

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
  try {
    await app.listen(port);
    Logger.log(`🚀 Application is running on: http://localhost:${port}`);
  } catch (error) {
    Logger.error('Failed to start application', error);
    process.exit(1);
  }
}
bootstrap();
