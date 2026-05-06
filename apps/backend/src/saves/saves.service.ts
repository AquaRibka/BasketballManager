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

const SAVE_MATCH_SELECT = {
  id: true,
  seasonId: true,
  round: true,
  status: true,
  date: true,
  homeScore: true,
  awayScore: true,
  winnerTeamId: true,
  playedAt: true,
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
} satisfies Prisma.MatchSelect;

const SAVE_STANDINGS_SELECT = {
  teamId: true,
  wins: true,
  losses: true,
  pointsFor: true,
  pointsAgainst: true,
  pointDiff: true,
  updatedAt: true,
  team: {
    select: {
      name: true,
      shortName: true,
    },
  },
} satisfies Prisma.StandingSelect;

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

function mapScheduleMatchesToRounds(
  matches: Array<{
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
  }>,
) {
  return matches.reduce<
    Array<{
      round: number;
      status: MatchStatus;
      matches: Array<{
        id: string;
        seasonId: string | null;
        round: number | null;
        status: MatchStatus;
        date: string | null;
        homeScore: number | null;
        awayScore: number | null;
        winnerTeamId: string | null;
        playedAt: string | null;
        homeTeam: { id: string; name: string; shortName: string };
        awayTeam: { id: string; name: string; shortName: string };
      }>;
    }>
  >((accumulator, match) => {
    const existingRound = accumulator.find((roundEntry) => roundEntry.round === match.round);
    const serializedMatch = {
      ...match,
      date: match.date?.toISOString() ?? null,
      playedAt: match.playedAt?.toISOString() ?? null,
    };

    if (existingRound) {
      existingRound.matches.push(serializedMatch);
      existingRound.status = existingRound.matches.every(
        (roundMatch) => roundMatch.status === MatchStatus.COMPLETED,
      )
        ? MatchStatus.COMPLETED
        : MatchStatus.SCHEDULED;

      return accumulator;
    }

    accumulator.push({
      round: match.round ?? 0,
      status: match.status === MatchStatus.COMPLETED ? MatchStatus.COMPLETED : MatchStatus.SCHEDULED,
      matches: [serializedMatch],
    });

    return accumulator;
  }, []);
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
      const createdMatches: Array<{
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
      }> = [];

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

        createdMatches.push(match);
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

      const rounds = mapScheduleMatchesToRounds(createdMatches);

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

  async getSave(id: string) {
    const careerSave = await this.prisma.careerSave.findUnique({
      where: { id },
      include: {
        selectedTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        currentSeason: true,
      },
    });

    if (!careerSave) {
      throw new NotFoundException('Save not found');
    }

    const matches = await this.prisma.match.findMany({
      where: {
        seasonId: careerSave.currentSeasonId,
      },
      select: SAVE_MATCH_SELECT,
      orderBy: [{ round: 'asc' }, { date: 'asc' }, { createdAt: 'asc' }],
    });

    const standings = await this.prisma.standing.findMany({
      where: {
        seasonId: careerSave.currentSeasonId,
      },
      select: SAVE_STANDINGS_SELECT,
    });

    const rounds = mapScheduleMatchesToRounds(matches);
    const sortedStandings = [...standings].sort((left, right) => {
      if (right.wins !== left.wins) {
        return right.wins - left.wins;
      }

      if (right.pointDiff !== left.pointDiff) {
        return right.pointDiff - left.pointDiff;
      }

      if (right.pointsFor !== left.pointsFor) {
        return right.pointsFor - left.pointsFor;
      }

      return left.team.name.localeCompare(right.team.name);
    });

    const standingsItems = sortedStandings.map((standing, index) => {
      const gamesPlayed = standing.wins + standing.losses;

      return {
        position: index + 1,
        teamId: standing.teamId,
        teamName: standing.team.name,
        shortName: standing.team.shortName,
        gamesPlayed,
        wins: standing.wins,
        losses: standing.losses,
        pointsFor: standing.pointsFor,
        pointsAgainst: standing.pointsAgainst,
        pointDiff: standing.pointDiff,
        winPercentage: gamesPlayed === 0 ? 0 : Number((standing.wins / gamesPlayed).toFixed(3)),
      };
    });

    const updatedAt =
      standings.length === 0
        ? null
        : new Date(
            Math.max(...standings.map((standing) => standing.updatedAt.getTime())),
          ).toISOString();

    const champion =
      careerSave.currentSeason.status === SeasonStatus.COMPLETED && standingsItems.length > 0
        ? {
            teamId: standingsItems[0].teamId,
            teamName: standingsItems[0].teamName,
            shortName: standingsItems[0].shortName,
          }
        : null;

    return {
      save: {
        id: careerSave.id,
        name: careerSave.saveName,
        teamId: careerSave.selectedTeam.id,
        teamName: careerSave.selectedTeam.name,
        seasonId: careerSave.currentSeasonId,
        currentRound: careerSave.currentRound,
        status: 'ACTIVE' as const,
        createdAt: careerSave.createdAt.toISOString(),
        updatedAt: careerSave.updatedAt.toISOString(),
      },
      season: {
        id: careerSave.currentSeason.id,
        name: careerSave.currentSeason.name,
        year: careerSave.currentSeason.year,
        status: careerSave.currentSeason.status,
        currentRound: careerSave.currentSeason.currentRound,
        totalRounds: rounds.length,
        teamCount: standingsItems.length,
        startedAt: careerSave.currentSeason.startedAt.toISOString(),
        finishedAt: careerSave.currentSeason.finishedAt?.toISOString() ?? null,
        createdAt: careerSave.currentSeason.createdAt.toISOString(),
        updatedAt: careerSave.currentSeason.updatedAt.toISOString(),
      },
      schedule: {
        seasonId: careerSave.currentSeasonId,
        rounds,
        totalRounds: rounds.length,
        totalMatches: matches.length,
      },
      standings: {
        seasonId: careerSave.currentSeasonId,
        seasonStatus: careerSave.currentSeason.status,
        isFinal: careerSave.currentSeason.status === SeasonStatus.COMPLETED,
        updatedAt,
        champion,
        items: standingsItems,
      },
    };
  }
}
