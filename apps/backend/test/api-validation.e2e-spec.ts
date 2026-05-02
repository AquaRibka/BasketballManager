import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { createApiValidationPipe } from '../src/common/pipes/create-api-validation-pipe';
import { PrismaService } from '../src/prisma/prisma.service';

const VALID_CUID = 'cmolpef3i0000f3sbsx7ulstg';

describe('API validation', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const prismaMock = {
      $queryRaw: jest.fn(),
      team: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      player: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(createApiValidationPipe());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects blank team names', async () => {
    const response = await request(app.getHttpServer()).post('/teams').send({
      name: '   ',
      city: 'Moscow',
      shortName: 'DYN',
      rating: 80,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('name should not be empty');
  });

  it('rejects invalid team ids', async () => {
    const response = await request(app.getHttpServer()).get('/teams/not-a-cuid');

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('id must be a valid cuid');
  });

  it('rejects invalid roster ids', async () => {
    const response = await request(app.getHttpServer()).get('/teams/not-a-cuid/players');

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('id must be a valid cuid');
  });

  it('rejects invalid player positions', async () => {
    const response = await request(app.getHttpServer()).post('/players').send({
      name: 'Test Player',
      age: 22,
      position: 'QB',
      shooting: 80,
      passing: 80,
      defense: 80,
      rebounding: 80,
      athleticism: 80,
      potential: 85,
      overall: 82,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      'position must be one of the following values: PG, SG, SF, PF, C',
    );
  });

  it('rejects player attributes outside the allowed range', async () => {
    const response = await request(app.getHttpServer()).patch(`/players/${VALID_CUID}`).send({
      shooting: 101,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('shooting must not be greater than 100');
  });

  it('rejects invalid team ids inside player payloads', async () => {
    const response = await request(app.getHttpServer()).post('/players').send({
      name: 'Test Player',
      age: 22,
      position: 'PG',
      shooting: 80,
      passing: 80,
      defense: 80,
      rebounding: 80,
      athleticism: 80,
      potential: 85,
      overall: 82,
      teamId: 'invalid-team-id',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('teamId must be a valid cuid');
  });
});
