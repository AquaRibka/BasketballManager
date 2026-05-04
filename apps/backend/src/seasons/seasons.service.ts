import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MatchStatus, SeasonStatus, type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeasonDto } from './dto/create-season.dto';

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

type SchedulePairing = {
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  date: Date;
};

function rotateTeams(teamIds: Array<string | null>) {
  if (teamIds.length <= 2) {
    return teamIds;
  }

  const [fixed, ...rest] = teamIds;
  const last = rest.pop();

  return [fixed, last ?? null, ...rest];
}

function createRoundRobinSchedule(teamIds: string[], seasonStartDate: Date) {
  const normalizedTeamIds = teamIds.length % 2 === 0 ? [...teamIds] : [...teamIds, null];
  const roundsPerCycle = normalizedTeamIds.length - 1;
  const matchesPerRound = normalizedTeamIds.length / 2;
  const cycles = 4;
  const pairings: SchedulePairing[] = [];
  let rotation = [...normalizedTeamIds];

  for (let cycleIndex = 0; cycleIndex < cycles; cycleIndex += 1) {
    for (let roundIndex = 0; roundIndex < roundsPerCycle; roundIndex += 1) {
      const globalRound = cycleIndex * roundsPerCycle + roundIndex + 1;
      const roundDate = new Date(seasonStartDate);
      roundDate.setUTCDate(roundDate.getUTCDate() + (globalRound - 1) * 7);

      for (let matchIndex = 0; matchIndex < matchesPerRound; matchIndex += 1) {
        const leftTeamId = rotation[matchIndex];
        const rightTeamId = rotation[rotation.length - 1 - matchIndex];

        if (!leftTeamId || !rightTeamId) {
          continue;
        }

        const scheduledDate = new Date(roundDate);
        scheduledDate.setUTCHours(18 + matchIndex * 2, 0, 0, 0);

        pairings.push({
          round: globalRound,
          homeTeamId: cycleIndex % 2 === 0 ? leftTeamId : rightTeamId,
          awayTeamId: cycleIndex % 2 === 0 ? rightTeamId : leftTeamId,
          date: scheduledDate,
        });
      }

      rotation = rotateTeams(rotation);
    }
  }

  return pairings;
}

@Injectable()
export class SeasonsService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.season.create({
      data: {
        name: createSeasonDto.name.trim(),
        year: createSeasonDto.year,
        status: SeasonStatus.IN_PROGRESS,
      },
    });
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

    if (existingMatches.length > 0) {
      throw new ConflictException('Schedule already exists for this season');
    }

    const teams = await this.prisma.team.findMany({
      orderBy: [{ name: 'asc' }],
      select: {
        id: true,
      },
    });

    if (teams.length < 2) {
      throw new UnprocessableEntityException('At least two teams are required to generate schedule');
    }

    const pairings = createRoundRobinSchedule(
      teams.map((team) => team.id),
      season.startedAt,
    );

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

      if (left.losses !== right.losses) {
        return left.losses - right.losses;
      }

      if (right.pointDiff !== left.pointDiff) {
        return right.pointDiff - left.pointDiff;
      }

      if (right.pointsFor !== left.pointsFor) {
        return right.pointsFor - left.pointsFor;
      }

      return left.team.shortName.localeCompare(right.team.shortName);
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
