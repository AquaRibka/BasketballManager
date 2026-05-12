import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type {
  PlayerAudienceSentiment,
  PlayerMediaStatus,
  PlayerSocialPlatform,
  Prisma,
} from '@prisma/client';
import { VTB_LEAGUE_SHORT_NAMES } from '../leagues/vtb-league';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeams() {
    const items = await this.prisma.team.findMany({
      where: {
        shortName: {
          in: [...VTB_LEAGUE_SHORT_NAMES],
        },
      },
      orderBy: [{ name: 'asc' }],
    });

    return {
      items,
      total: items.length,
    };
  }

  async getTeamById(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        players: {
          include: {
            physicalProfile: {
              select: {
                heightCm: true,
                weightKg: true,
                wingspanCm: true,
                bodyType: true,
                speed: true,
                acceleration: true,
                vertical: true,
                strength: true,
                endurance: true,
                balance: true,
                agility: true,
                coordination: true,
                reaction: true,
                recovery: true,
                explosiveness: true,
              },
            },
            healthProfile: {
              select: {
                overallCondition: true,
                fatigue: true,
                postInjuryCondition: true,
                injuryRisk: true,
                durability: true,
                recoveryRate: true,
                painTolerance: true,
                medicalOutlook: true,
              },
            },
            mentalAttributes: {
              select: {
                confidence: true,
                selfControl: true,
                concentration: true,
                determination: true,
                workEthic: true,
                leadership: true,
                aggressiveness: true,
                teamwork: true,
              },
            },
            tacticalAttributes: {
              select: {
                basketballIQ: true,
                shotSelection: true,
                courtVision: true,
                defenseReading: true,
                offenseReading: true,
                decisionMaking: true,
                offBallMovement: true,
                spacing: true,
                pickAndRollOffense: true,
                pickAndRollDefense: true,
                helpDefense: true,
                discipline: true,
              },
            },
            socialProfile: {
              select: {
                platform: true,
                nickname: true,
                followersCount: true,
                followerGrowthWeekly: true,
                engagementRate: true,
                audienceSentiment: true,
                mediaStatus: true,
                hypeScore: true,
                controversyScore: true,
                marketabilityScore: true,
                lastUpdatedAt: true,
              },
            },
          },
          orderBy: [{ overall: 'desc' }, { name: 'asc' }],
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return {
      ...team,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      players: team.players.map((player) => this.mapTeamPlayer(player)),
    };
  }

  async getTeamPlayers(id: string) {
    await this.ensureTeamExists(id);

    const items = await this.prisma.player.findMany({
      where: {
        teamId: id,
      },
      include: {
        physicalProfile: {
          select: {
            heightCm: true,
            weightKg: true,
            wingspanCm: true,
            bodyType: true,
            speed: true,
            acceleration: true,
            vertical: true,
            strength: true,
            endurance: true,
            balance: true,
            agility: true,
            coordination: true,
            reaction: true,
            recovery: true,
            explosiveness: true,
          },
        },
        healthProfile: {
          select: {
            overallCondition: true,
            fatigue: true,
            postInjuryCondition: true,
            injuryRisk: true,
            durability: true,
            recoveryRate: true,
            painTolerance: true,
            medicalOutlook: true,
          },
        },
        mentalAttributes: {
          select: {
            confidence: true,
            selfControl: true,
            concentration: true,
            determination: true,
            workEthic: true,
            leadership: true,
            aggressiveness: true,
            teamwork: true,
          },
        },
        tacticalAttributes: {
          select: {
            basketballIQ: true,
            shotSelection: true,
            courtVision: true,
            defenseReading: true,
            offenseReading: true,
            decisionMaking: true,
            offBallMovement: true,
            spacing: true,
            pickAndRollOffense: true,
            pickAndRollDefense: true,
            helpDefense: true,
            discipline: true,
          },
        },
        socialProfile: {
          select: {
            platform: true,
            nickname: true,
            followersCount: true,
            followerGrowthWeekly: true,
            engagementRate: true,
            audienceSentiment: true,
            mediaStatus: true,
            hypeScore: true,
            controversyScore: true,
            marketabilityScore: true,
            lastUpdatedAt: true,
          },
        },
      },
      orderBy: [{ position: 'asc' }, { overall: 'desc' }, { name: 'asc' }],
    });

    return {
      teamId: id,
      items: items.map((player) => this.mapTeamPlayer(player)),
      total: items.length,
    };
  }

  async createTeam(createTeamDto: CreateTeamDto) {
    try {
      return await this.prisma.team.create({
        data: this.toCreateData(createTeamDto),
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async updateTeam(id: string, updateTeamDto: UpdateTeamDto) {
    await this.ensureTeamExists(id);

    try {
      return await this.prisma.team.update({
        where: { id },
        data: this.toUpdateData(updateTeamDto),
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  private toCreateData(createTeamDto: CreateTeamDto): Prisma.TeamCreateInput {
    return {
      name: createTeamDto.name.trim(),
      city: createTeamDto.city.trim(),
      shortName: createTeamDto.shortName.trim().toUpperCase(),
      rating: createTeamDto.rating,
    };
  }

  private toUpdateData(updateTeamDto: UpdateTeamDto): Prisma.TeamUpdateInput {
    const data: Prisma.TeamUpdateInput = {};

    if (typeof updateTeamDto.name === 'string') {
      data.name = updateTeamDto.name.trim();
    }

    if (typeof updateTeamDto.city === 'string') {
      data.city = updateTeamDto.city.trim();
    }

    if (typeof updateTeamDto.shortName === 'string') {
      data.shortName = updateTeamDto.shortName.trim().toUpperCase();
    }

    if (typeof updateTeamDto.rating === 'number') {
      data.rating = updateTeamDto.rating;
    }

    return data;
  }

  private async ensureTeamExists(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }
  }

  private handlePersistenceError(error: unknown): never {
    if (this.getPrismaErrorCode(error) === 'P2002') {
      throw new ConflictException('Team shortName must be unique');
    }

    throw new UnprocessableEntityException('Team data is invalid');
  }

  private getPrismaErrorCode(error: unknown) {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return null;
    }

    return typeof error.code === 'string' ? error.code : null;
  }

  private mapTeamPlayer(player: {
    id: string;
    name: string;
    age: number;
    dateOfBirth: Date | null;
    dominantHand: string | null;
    position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
    secondaryPositions: Array<'PG' | 'SG' | 'SF' | 'PF' | 'C'>;
    shooting: number;
    passing: number;
    defense: number;
    rebounding: number;
    athleticism: number;
    overall: number;
    teamId: string | null;
    createdAt: Date;
    updatedAt: Date;
    physicalProfile: {
      heightCm: number;
      weightKg: number;
      wingspanCm: number | null;
      bodyType: string | null;
      speed: number;
      acceleration: number;
      vertical: number;
      strength: number;
      endurance: number;
      balance: number;
      agility: number;
      coordination: number;
      reaction: number;
      recovery: number;
      explosiveness: number;
    } | null;
    healthProfile: {
      overallCondition: number;
      fatigue: number;
      postInjuryCondition: number;
      injuryRisk: number;
      durability: number;
      recoveryRate: number;
      painTolerance: number;
      medicalOutlook: number;
    } | null;
    mentalAttributes: {
      confidence: number;
      selfControl: number;
      concentration: number;
      determination: number;
      workEthic: number;
      leadership: number;
      aggressiveness: number;
      teamwork: number;
    } | null;
    tacticalAttributes: {
      basketballIQ: number;
      shotSelection: number;
      courtVision: number;
      defenseReading: number;
      offenseReading: number;
      decisionMaking: number;
      offBallMovement: number;
      spacing: number;
      pickAndRollOffense: number;
      pickAndRollDefense: number;
      helpDefense: number;
      discipline: number;
    } | null;
    socialProfile: {
      platform: PlayerSocialPlatform;
      nickname: string;
      followersCount: number;
      followerGrowthWeekly: number;
      engagementRate: number;
      audienceSentiment: PlayerAudienceSentiment;
      mediaStatus: PlayerMediaStatus;
      hypeScore: number;
      controversyScore: number;
      marketabilityScore: number;
      lastUpdatedAt: Date;
    } | null;
  }) {
    return {
      ...player,
      dateOfBirth: player.dateOfBirth?.toISOString() ?? null,
      createdAt: player.createdAt.toISOString(),
      updatedAt: player.updatedAt.toISOString(),
      healthProfile: player.healthProfile,
      psychologyProfile: player.mentalAttributes
        ? {
            selfControl: player.mentalAttributes.selfControl,
            concentration: player.mentalAttributes.concentration,
            determination: player.mentalAttributes.determination,
            leadership: player.mentalAttributes.leadership,
            workEthic: player.mentalAttributes.workEthic,
            aggressiveness: player.mentalAttributes.aggressiveness,
            teamwork: player.mentalAttributes.teamwork,
            confidence: player.mentalAttributes.confidence,
          }
        : null,
      tacticalProfile: player.tacticalAttributes
        ? {
            basketballIQ: player.tacticalAttributes.basketballIQ,
            shotSelection: player.tacticalAttributes.shotSelection,
            courtVision: player.tacticalAttributes.courtVision,
            defenseReading: player.tacticalAttributes.defenseReading,
            offenseReading: player.tacticalAttributes.offenseReading,
            decisionMaking: player.tacticalAttributes.decisionMaking,
            offBallMovement: player.tacticalAttributes.offBallMovement,
            spacing: player.tacticalAttributes.spacing,
            pickAndRollOffense: player.tacticalAttributes.pickAndRollOffense,
            pickAndRollDefense: player.tacticalAttributes.pickAndRollDefense,
            helpDefense: player.tacticalAttributes.helpDefense,
            discipline: player.tacticalAttributes.discipline,
          }
        : null,
      socialProfile: player.socialProfile
        ? {
            platform: player.socialProfile.platform,
            nickname: player.socialProfile.nickname,
            followersCount: player.socialProfile.followersCount,
            followerGrowthWeekly: player.socialProfile.followerGrowthWeekly,
            engagementRate: player.socialProfile.engagementRate,
            audienceSentiment: player.socialProfile.audienceSentiment,
            mediaStatus: player.socialProfile.mediaStatus,
            hypeScore: player.socialProfile.hypeScore,
            controversyScore: player.socialProfile.controversyScore,
            marketabilityScore: player.socialProfile.marketabilityScore,
            lastUpdatedAt: player.socialProfile.lastUpdatedAt.toISOString(),
          }
        : null,
    };
  }
}
