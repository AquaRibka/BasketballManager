import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import path from 'node:path';
import { HealthModule } from './health/health.module';
import { MatchesModule } from './matches/matches.module';
import { PlayersModule } from './players/players.module';
import { PrismaModule } from './prisma/prisma.module';
import { SeasonsModule } from './seasons/seasons.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), '../../.env')],
    }),
    PrismaModule,
    HealthModule,
    MatchesModule,
    PlayersModule,
    SeasonsModule,
    TeamsModule,
  ],
})
export class AppModule {}
