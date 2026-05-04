import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../app.module';
import { ApiExceptionFilter } from '../common/errors/api-exception.filter';
import { createApiValidationPipe } from '../common/pipes/create-api-validation-pipe';
import { PrismaService } from '../prisma/prisma.service';

async function main() {
  let app: INestApplication | null = null;

  try {
    app = await NestFactory.create(AppModule, {
      logger: false,
    });
    app.useGlobalPipes(createApiValidationPipe());
    app.useGlobalFilters(new ApiExceptionFilter());

    await app.init();

    const prisma = app.get(PrismaService);
    const scheduledMatch = await prisma.match.findFirst({
      where: {
        status: 'SCHEDULED',
        homeTeam: {
          shortName: {
            in: ['TSTA', 'TSTB', 'TSTG'],
          },
        },
        awayTeam: {
          shortName: {
            in: ['TSTA', 'TSTB', 'TSTG'],
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        seasonId: true,
        round: true,
        homeTeam: {
          select: {
            shortName: true,
          },
        },
        awayTeam: {
          select: {
            shortName: true,
          },
        },
      },
    });

    if (!scheduledMatch) {
      throw new Error(
        'No scheduled test match found. Run `npm run prisma:seed:test` before this smoke-test.',
      );
    }

    const response = await request(app.getHttpServer()).post(
      `/matches/${scheduledMatch.id}/simulate`,
    );

    if (response.status !== 200) {
      throw new Error(
        `Simulation endpoint returned ${response.status}: ${JSON.stringify(response.body)}`,
      );
    }

    if (response.body.status !== 'COMPLETED') {
      throw new Error(`Expected completed status, received: ${response.body.status}`);
    }

    if (response.body.standingsUpdateRequired !== false) {
      throw new Error(
        `Expected standingsUpdateRequired=false, received: ${response.body.standingsUpdateRequired}`,
      );
    }

    console.log('Backend simulation smoke-test completed successfully.');
    console.log(`Match: ${scheduledMatch.id}`);
    console.log(`Season: ${scheduledMatch.seasonId} Round: ${scheduledMatch.round}`);
    console.log(
      `${scheduledMatch.homeTeam.shortName} ${response.body.homeScore} - ${response.body.awayScore} ${scheduledMatch.awayTeam.shortName}`,
    );
    console.log(`Winner: ${response.body.winnerTeamId}`);
  } finally {
    if (app) {
      await app.close();
    }
  }
}

main().catch((error) => {
  console.error('Backend simulation smoke-test failed.');
  console.error(error);
  process.exitCode = 1;
});
