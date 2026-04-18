import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Global Filter and Interceptor
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger Setup (Harvest Market brand bar aligns with frontend --primary)
  const config = new DocumentBuilder()
    .setTitle('Vegetables Analytics API')
    .setDescription(
      'REST API for Sri Lankan vegetable and fruit market price analytics: products, historical prices, statistics, trends, scheduled sync, and grocery lists. Consumed by the Vegetables Analytics web dashboard.',
    )
    .setVersion('1.0')
    .setContact('Vegetables Analytics', 'https://vegetables-analytics.com', '')
    .addTag('products', 'Product catalog and lookups')
    .addTag('prices', 'Price records, current and latest market prices')
    .addTag('analytics', 'Statistics, trends, distribution, and comparisons')
    .addTag('sync', 'Manual and scheduled synchronization from external price sources')
    .addTag('grocery-list', 'Shopping list items and export helpers')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Vegetables Analytics API · Docs',
    customCss: `
      .swagger-ui .topbar { background-color: #15803d; }
      .swagger-ui .topbar .download-url-wrapper .select-label { color: #ecfdf5; }
    `,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

