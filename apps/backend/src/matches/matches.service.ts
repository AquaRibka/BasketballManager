import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import type {
  MatchSimulationInput,
  MatchSimulationPlayerSnapshot,
  MatchSimulationTeamSnapshot,
} from '@basketball-manager/shared';
import { simulateMatch } from '@basketball-manager/simulation-engine';
import { PrismaService } from '../prisma/prisma.service';

function toMatchSimulationPlayerSnapshot(player: {
  id: string;
  name: string;
  position: MatchSimulationPlayerSnapshot['position'];
  overall: number;
  shooting: number;
  passing: number;
  defense: number;
  rebounding: number;
  athleticism: number;
}): MatchSimulationPlayerSnapshot {
  return {
    id: player.id,
    name: player.name,
    position: player.position,
    overall: player.overall,
    shooting: player.shooting,
    passing: player.passing,
    defense: player.defense,
    rebounding: player.rebounding,
    athleticism: player.athleticism,
  };
}

function toMatchSimulationTeamSnapshot(team: {
  id: string;
  name: string;
  shortName: string;
  rating: number;
  players: Array<Parameters<typeof toMatchSimulationPlayerSnapshot>[0]>;
}): MatchSimulationTeamSnapshot {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    rating: team.rating,
    players: team.players.map(toMatchSimulationPlayerSnapshot),
  };
}

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
                id: true,
                name: true,
                position: true,
                overall: true,
                shooting: true,
                passing: true,
                defense: true,
                rebounding: true,
                athleticism: true,
              },
            },
          },
        },
        awayTeam: {
          include: {
            players: {
              select: {
                id: true,
                name: true,
                position: true,
                overall: true,
                shooting: true,
                passing: true,
                defense: true,
                rebounding: true,
                athleticism: true,
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

    const simulationInput: MatchSimulationInput = {
      matchId: match.id,
      seed: match.id,
      homeTeam: toMatchSimulationTeamSnapshot(match.homeTeam),
      awayTeam: toMatchSimulationTeamSnapshot(match.awayTeam),
    };
    const result = simulateMatch(simulationInput);

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
