import { Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus, SeasonStatus, type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createRoundRobinSchedule } from '../seasons/schedule-generator';
import { CreateSaveDto } from './dto/create-save.dto';

const SAVE_TEAM_SELECT = {
  id: true,
  name: true,
  shortName: true,
} satisfies Prisma.TeamSelect;

function buildInitialStandingRows(
  seasonId: string,
  teams: Array<{ id: string }>,
) {
  return teams.map((team, index) => ({
    seasonId,
    teamId: team.id,
    position: index + 1,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pointDiff: 0,
  }));
}

@Injectable()
export class SavesService {
  constructor(private readonly prisma: PrismaService) {}

  async createSave(createSaveDto: CreateSaveDto) {
    const selectedTeam = await this.prisma.team.findUnique({
      where: { id: createSaveDto.teamId },
      select: SAVE_TEAM_SELECT,
    });

    if (!selectedTeam) {
      throw new NotFoundException('Team not found');
    }

    const leagueTeams = await this.prisma.team.findMany({
      orderBy: [{ name: 'asc' }],
      select: SAVE_TEAM_SELECT,
    });

    const createdAt = new Date();
    const year = createdAt.getUTCFullYear();

    return this.prisma.$transaction(async (tx) => {
      const season = await tx.season.create({
        data: {
          name: `VTB League MVP ${year}`,
          year,
          status: SeasonStatus.IN_PROGRESS,
          currentRound: 1,
        },
      });

      const pairings = createRoundRobinSchedule(
        leagueTeams.map((team) => team.id),
        season.startedAt,
      );

      const roundsMap = new Map<
        number,
        Array<{
          id: string;
          seasonId: string | null;
          round: number | null;
          status: MatchStatus;
          date: Date | null;
          homeScore: number | null;
          awayScore: number | null;
          winnerTeamId: string | null;
          playedAt: Date | null;
          homeTeam: { id: string; name: string; shortName: string };
          awayTeam: { id: string; name: string; shortName: string };
        }>
      >();

      for (const pairing of pairings) {
        const match = await tx.match.create({
          data: {
            season: {
              connect: {
                id: season.id,
              },
            },
            round: pairing.round,
            date: pairing.date,
            homeTeam: {
              connect: {
                id: pairing.homeTeamId,
              },
            },
            awayTeam: {
              connect: {
                id: pairing.awayTeamId,
              },
            },
            status: MatchStatus.SCHEDULED,
            standingsUpdateRequired: false,
          },
          include: {
            homeTeam: {
              select: {
                id: true,
                name: true,
                shortName: true,
              },
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                shortName: true,
              },
            },
          },
        });

        const roundMatches = roundsMap.get(pairing.round) ?? [];
        roundMatches.push(match);
        roundsMap.set(pairing.round, roundMatches);
      }

      const standingRows = buildInitialStandingRows(season.id, leagueTeams);

      for (const standingRow of standingRows) {
        await tx.standing.create({
          data: standingRow,
        });
      }

      const careerSave = await tx.careerSave.create({
        data: {
          saveName: createSaveDto.name.trim(),
          selectedTeam: {
            connect: {
              id: selectedTeam.id,
            },
          },
          currentSeason: {
            connect: {
              id: season.id,
            },
          },
          currentDate: season.startedAt,
          currentRound: 1,
        },
      });

      const rounds = [...roundsMap.entries()]
        .sort(([left], [right]) => left - right)
        .map(([round, matches]) => ({
          round,
          status: MatchStatus.SCHEDULED,
          matches: matches.map((match) => ({
            ...match,
            date: match.date?.toISOString() ?? null,
            playedAt: match.playedAt?.toISOString() ?? null,
          })),
        }));

      const standingsItems = leagueTeams.map((team, index) => ({
        position: index + 1,
        teamId: team.id,
        teamName: team.name,
        shortName: team.shortName,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
        winPercentage: 0,
      }));

      return {
        save: {
          id: careerSave.id,
          name: careerSave.saveName,
          teamId: selectedTeam.id,
          teamName: selectedTeam.name,
          seasonId: season.id,
          currentRound: careerSave.currentRound,
          status: 'ACTIVE' as const,
          createdAt: careerSave.createdAt.toISOString(),
          updatedAt: careerSave.updatedAt.toISOString(),
        },
        season: {
          id: season.id,
          name: season.name,
          year: season.year,
          status: season.status,
          currentRound: season.currentRound,
          totalRounds: rounds.length,
          teamCount: leagueTeams.length,
          startedAt: season.startedAt.toISOString(),
          finishedAt: season.finishedAt?.toISOString() ?? null,
          createdAt: season.createdAt.toISOString(),
          updatedAt: season.updatedAt.toISOString(),
        },
        schedule: {
          seasonId: season.id,
          rounds,
          totalRounds: rounds.length,
          totalMatches: pairings.length,
        },
        standings: {
          seasonId: season.id,
          seasonStatus: season.status,
          isFinal: false,
          updatedAt: careerSave.createdAt.toISOString(),
          champion: null,
          items: standingsItems,
        },
      };
    });
  }
}
