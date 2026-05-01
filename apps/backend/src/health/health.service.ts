import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    try {
      const [{ databaseName }] =
        await this.prisma.$queryRaw<{ databaseName: string }[]>`SELECT current_database() AS "databaseName"`;

      return {
        httpStatus: 200,
        body: {
          status: 'ok',
          service: 'backend',
          database: {
            status: 'ok',
            name: databaseName,
          },
        },
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Database connection failed';

      return {
        httpStatus: 503,
        body: {
          status: 'error',
          service: 'backend',
          database: {
            status: 'error',
            message,
          },
        },
      };
    }
  }
}
