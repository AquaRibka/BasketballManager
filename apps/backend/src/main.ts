import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ApiExceptionFilter } from './common/errors/api-exception.filter';
import { createApiValidationPipe } from './common/pipes/create-api-validation-pipe';
import { SWAGGER_API_GUIDE } from './docs/swagger-description';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  app.enableShutdownHooks();
  prismaService.enableShutdownHooks(app);
  app.useGlobalPipes(createApiValidationPipe());
  app.useGlobalFilters(new ApiExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Basketball Manager API')
    .setDescription(SWAGGER_API_GUIDE)
    .setVersion('1.0')
    .addTag('Health', 'Service and database health checks')
    .addTag('Teams', 'Team and roster endpoints')
    .addTag('Players', 'Player endpoints')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    jsonDocumentUrl: 'api/docs-json',
  });

  const host = configService.get<string>('HOST', '0.0.0.0');
  const port = Number(configService.get<string>('PORT', '3000'));

  await app.listen(port, host);
}

bootstrap();
