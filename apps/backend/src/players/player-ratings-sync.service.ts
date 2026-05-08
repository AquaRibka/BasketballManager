import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculatePlayerOverall } from './lib/player-overall';

const DEFAULT_TEAM_RATING = 60;

@Injectable()
export class PlayerRatingsSyncService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.syncStoredRatings();
  }

  private async syncStoredRatings() {
    const players = await this.prisma.player.findMany({
      select: {
        id: true,
        position: true,
        shooting: true,
        passing: true,
        defense: true,
        rebounding: true,
        athleticism: true,
        potential: true,
      },
    });

    await this.prisma.$transaction(async (tx) => {
      for (const player of players) {
        const calculatedOverall = calculatePlayerOverall({
          position: player.position,
          shooting: player.shooting,
          passing: player.passing,
          defense: player.defense,
          rebounding: player.rebounding,
          athleticism: player.athleticism,
        });
        const overall = Math.min(calculatedOverall, player.potential);

        await tx.player.update({
          where: { id: player.id },
          data: { overall },
        });
      }

      const teams = await tx.team.findMany({
        select: {
          id: true,
          players: {
            select: {
              overall: true,
            },
            orderBy: [{ overall: 'desc' }, { name: 'asc' }],
          },
        },
      });

      for (const team of teams) {
        const rating = this.calculateDerivedTeamRating(team.players);

        await tx.team.update({
          where: { id: team.id },
          data: { rating },
        });
      }
    });
  }

  private calculateDerivedTeamRating(players: Array<{ overall: number }>) {
    if (players.length === 0) {
      return DEFAULT_TEAM_RATING;
    }

    const totalOverall = players.reduce((sum, player) => sum + player.overall, 0);

    return Math.round(totalOverall / players.length);
  }
}
