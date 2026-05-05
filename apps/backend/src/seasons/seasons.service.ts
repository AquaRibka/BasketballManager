import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MatchStatus, SeasonStatus, type Prisma } from '@prisma/client';
import { MatchesService } from '../matches/matches.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { createRoundRobinSchedule } from './schedule-generator';

const SCHEDULE_MATCH_SELECT = {
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

const STANDINGS_SELECT = {
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

function buildInitialStandingRows(seasonId: string, teamIds: string[]) {
  return [...teamIds].sort((left, right) => left.localeCompare(right)).map((teamId, index) => ({
    seasonId,
    teamId,
    position: index + 1,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pointDiff: 0,
  }));
}

@Injectable()
export class SeasonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matchesService: MatchesService,
  ) {}

  async createSeason(createSeasonDto: CreateSeasonDto) {
    const existingCurrentSeason = await this.prisma.season.findFirst({
      where: {
        status: SeasonStatus.IN_PROGRESS,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    if (existingCurrentSeason) {
      throw new ConflictException('Current season already exists');
    }

    const teams = await this.prisma.team.findMany({
      orderBy: [{ name: 'asc' }],
      select: {
        id: true,
      },
    });

    let createdSeason;

    try {
      createdSeason = await this.prisma.$transaction(async (tx) => {
        const season = await tx.season.create({
          data: {
            name: createSeasonDto.name.trim(),
            year: createSeasonDto.year,
            status: SeasonStatus.IN_PROGRESS,
          },
        });

        const teamIds = teams.map((team) => team.id);
        const pairings = createRoundRobinSchedule(teamIds, season.startedAt);
        const standingRows = buildInitialStandingRows(season.id, teamIds);

        for (const pairing of pairings) {
          await tx.match.create({
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
          });
        }

        for (const standingRow of standingRows) {
          await tx.standing.create({
            data: standingRow,
          });
        }

        return season;
      });
    } catch (error) {
      if (error instanceof RangeError || error instanceof TypeError) {
        throw new UnprocessableEntityException(error.message);
      }

      throw error;
    }

    return createdSeason;
  }

  async getCurrentSeason() {
    const season = await this.prisma.season.findFirst({
      where: {
        status: SeasonStatus.IN_PROGRESS,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    if (!season) {
      throw new NotFoundException('Current season not found');
    }

    return season;
  }

  async generateSchedule(id: string) {
    const season = await this.prisma.season.findUnique({
      where: { id },
      select: {
        id: true,
        startedAt: true,
      },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    const existingMatches = await this.prisma.match.findMany({
      where: {
        seasonId: id,
      },
      select: {
        id: true,
      },
    });
    const existingStandings = await this.prisma.standing.findMany({
      where: {
        seasonId: id,
      },
      select: {
        id: true,
      },
    });

    if (existingMatches.length > 0) {
      throw new ConflictException('Schedule already exists for this season');
    }

    const teams = await this.prisma.team.findMany({
      orderBy: [{ name: 'asc' }],
      select: {
        id: true,
      },
    });

    let pairings;

    try {
      pairings = createRoundRobinSchedule(
        teams.map((team) => team.id),
        season.startedAt,
      );
    } catch (error) {
      if (error instanceof RangeError || error instanceof TypeError) {
        throw new UnprocessableEntityException(error.message);
      }

      throw error;
    }

    await this.prisma.$transaction(async (tx) => {
      for (const pairing of pairings) {
        await tx.match.create({
          data: {
            season: {
              connect: {
                id,
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
        });
      }

      if (existingStandings.length === 0) {
        for (const standingRow of buildInitialStandingRows(
          id,
          teams.map((team) => team.id),
        )) {
          await tx.standing.create({
            data: standingRow,
          });
        }
      }
    });

    return this.getSchedule(id);
  }

  async getSchedule(id: string) {
    await this.ensureSeasonExists(id);

    const matches = await this.prisma.match.findMany({
      where: {
        seasonId: id,
      },
      select: SCHEDULE_MATCH_SELECT,
      orderBy: [{ round: 'asc' }, { date: 'asc' }, { createdAt: 'asc' }],
    });

    if (matches.length === 0) {
      throw new NotFoundException('Schedule not found');
    }

    const rounds = matches.reduce<
      Array<{
        round: number;
        status: MatchStatus;
        matches: typeof matches;
      }>
    >((accumulator, match) => {
      const existingRound = accumulator.find((roundEntry) => roundEntry.round === match.round);

      if (existingRound) {
        existingRound.matches.push(match);
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
        matches: [match],
      });

      return accumulator;
    }, []);

    return {
      seasonId: id,
      rounds,
      totalRounds: rounds.length,
      totalMatches: matches.length,
    };
  }

  async getStandings(id: string) {
    await this.ensureSeasonExists(id);

    const standings = await this.prisma.standing.findMany({
      where: {
        seasonId: id,
      },
      select: STANDINGS_SELECT,
    });

    const sortedItems = [...standings].sort((left, right) => {
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

    const items = sortedItems.map((standing, index) => {
      const gamesPlayed = standing.wins + standing.losses;
      const winPercentage = gamesPlayed === 0 ? 0 : Number((standing.wins / gamesPlayed).toFixed(3));

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
        winPercentage,
      };
    });

    const updatedAt =
      standings.length === 0
        ? null
        : new Date(
            Math.max(...standings.map((standing) => standing.updatedAt.getTime())),
          ).toISOString();

    return {
      seasonId: id,
      updatedAt,
      items,
    };
  }

  async advanceToNextRound(id: string) {
    const season = await this.prisma.season.findUnique({
      where: { id },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    if (season.status === SeasonStatus.COMPLETED) {
      throw new ConflictException('Season is already completed');
    }

    const currentRoundMatches = await this.prisma.match.findMany({
      where: {
        seasonId: id,
        round: season.currentRound,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (currentRoundMatches.length === 0) {
      throw new ConflictException('Current round schedule not found');
    }

    const hasPendingMatches = currentRoundMatches.some(
      (match) => match.status !== MatchStatus.COMPLETED,
    );

    if (hasPendingMatches) {
      throw new ConflictException('Current round is not completed');
    }

    const nextRound = season.currentRound + 1;
    const nextRoundMatches = await this.prisma.match.findMany({
      where: {
        seasonId: id,
        round: nextRound,
      },
      select: {
        id: true,
      },
    });

    if (nextRoundMatches.length === 0) {
      const completedSeason = await this.prisma.season.update({
        where: { id },
        data: {
          status: SeasonStatus.COMPLETED,
          finishedAt: new Date(),
        },
      });

      return {
        seasonId: id,
        previousRound: season.currentRound,
        currentRound: completedSeason.currentRound,
        seasonStatus: completedSeason.status,
      };
    }

    const updatedSeason = await this.prisma.season.update({
      where: { id },
      data: {
        currentRound: nextRound,
        status: SeasonStatus.IN_PROGRESS,
      },
    });

    return {
      seasonId: id,
      previousRound: season.currentRound,
      currentRound: updatedSeason.currentRound,
      seasonStatus: updatedSeason.status,
    };
  }

  async simulateCurrentRound(id: string) {
    const season = await this.prisma.season.findUnique({
      where: { id },
      select: {
        id: true,
        currentRound: true,
        status: true,
      },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    if (season.status === SeasonStatus.COMPLETED) {
      throw new ConflictException('Season is already completed');
    }

    return this.matchesService.simulateSeasonRound(season.id, season.currentRound);
  }

  async updateSeasonStatus(id: string, status: SeasonStatus) {
    const season = await this.prisma.season.findUnique({
      where: { id },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }

    if (season.status === status) {
      return season;
    }

    if (season.status === SeasonStatus.COMPLETED && status === SeasonStatus.IN_PROGRESS) {
      throw new ConflictException('Season status transition is not allowed');
    }

    const data: Prisma.SeasonUpdateInput = {
      status,
      finishedAt: status === SeasonStatus.COMPLETED ? new Date() : null,
    };

    return this.prisma.season.update({
      where: { id },
      data,
    });
  }

  private async ensureSeasonExists(id: string) {
    const season = await this.prisma.season.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!season) {
      throw new NotFoundException('Season not found');
    }
  }
}
