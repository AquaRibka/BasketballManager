import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { createApiValidationPipe } from './common/pipes/create-api-validation-pipe';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  app.enableShutdownHooks();
  prismaService.enableShutdownHooks(app);
  app.useGlobalPipes(createApiValidationPipe());

  const host = configService.get<string>('HOST', '0.0.0.0');
  const port = Number(configService.get<string>('PORT', '3000'));

  await app.listen(port, host);
}

bootstrap();
