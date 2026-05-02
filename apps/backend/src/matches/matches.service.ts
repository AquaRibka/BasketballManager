import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { simulateMatch } from '@basketball-manager/simulation-engine';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async simulateMatch(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: {
          include: {
            players: {
              select: {
                overall: true,
              },
            },
          },
        },
        awayTeam: {
          include: {
            players: {
              select: {
                overall: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.status === MatchStatus.COMPLETED) {
      throw new ConflictException('Match has already been simulated');
    }

    const result = simulateMatch({
      matchId: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
    });

    const updatedMatch = await this.prisma.match.update({
      where: { id },
      data: {
        status: MatchStatus.COMPLETED,
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        winnerTeamId: result.winnerTeamId,
        playedAt: new Date(),
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            rating: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            rating: true,
          },
        },
      },
    });

    return updatedMatch;
  }
}
