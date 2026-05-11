import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type { PlayerCareerStatus, PlayerDevelopmentFocus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { calculatePlayerOverall, type PlayerOverallInput } from './lib/player-overall';

const DEFAULT_TEAM_RATING = 60;

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlayers() {
    const items = await this.prisma.player.findMany({
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
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
      orderBy: [{ overall: 'desc' }, { name: 'asc' }],
    });

    return {
      items: items.map((player) => this.mapPlayerResponse(player)),
      total: items.length,
    };
  }

  async getPlayerById(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
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
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        seasonStats: {
          select: {
            id: true,
            seasonLabel: true,
            league: true,
            gamesPlayed: true,
            gamesStarted: true,
            minutesPerGame: true,
            pointsPerGame: true,
            reboundsPerGame: true,
            assistsPerGame: true,
            stealsPerGame: true,
            blocksPerGame: true,
            turnoversPerGame: true,
            foulsPerGame: true,
            fgPct: true,
            threePct: true,
            ftPct: true,
            efficiencyRating: true,
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
              },
            },
          },
          orderBy: [{ seasonLabel: 'desc' }, { createdAt: 'desc' }],
        },
        awards: {
          select: {
            id: true,
            seasonLabel: true,
            awardType: true,
            league: true,
            description: true,
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
              },
            },
          },
          orderBy: [{ seasonLabel: 'desc' }, { createdAt: 'desc' }],
        },
        careerHistory: {
          select: {
            id: true,
            seasonLabel: true,
            league: true,
            role: true,
            jerseyNumber: true,
            status: true,
            transferDate: true,
            transferReason: true,
            achievements: true,
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
              },
            },
          },
          orderBy: [{ transferDate: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return this.mapPlayerResponse(player);
  }

  async getPlayerHealthById(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
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
        injuryHistory: {
          select: {
            id: true,
            title: true,
            bodyPart: true,
            severity: true,
            status: true,
            occurredAt: true,
            expectedReturnAt: true,
            returnedAt: true,
            gamesMissed: true,
            notes: true,
          },
          orderBy: [{ occurredAt: 'desc' }],
        },
      },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return {
      playerId: player.id,
      playerName: player.name,
      healthProfile: player.healthProfile,
      injuryHistory: player.injuryHistory.map((entry) => ({
        ...entry,
        occurredAt: entry.occurredAt.toISOString(),
        expectedReturnAt: entry.expectedReturnAt?.toISOString() ?? null,
        returnedAt: entry.returnedAt?.toISOString() ?? null,
      })),
    };
  }

  async getPlayerHiddenProfileById(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        mentalAttributes: {
          select: {
            professionalism: true,
            loyalty: true,
            ego: true,
          },
        },
        hiddenAttributes: {
          select: {
            consistency: true,
            injuryProneness: true,
            importantMatches: true,
            wantsToLeave: true,
            ambition: true,
            adaptability: true,
            pressureHandling: true,
            setbackResponse: true,
          },
        },
        potentialProfile: {
          select: {
            potential: true,
            potentialAbility: true,
            currentAbility: true,
            growthRate: true,
            developmentFocus: true,
            peakStartAge: true,
            peakEndAge: true,
            declineStartAge: true,
            learningAbility: true,
          },
        },
        reputationProfile: {
          select: {
            mediaAppeal: true,
            agentInfluence: true,
            hiddenReputation: true,
          },
        },
      },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return {
      id: player.id,
      name: player.name,
      hiddenProfile: this.mapPlayerHiddenProfile(player),
    };
  }

  async createPlayer(createPlayerDto: CreatePlayerDto) {
    const overall = this.calculateOverallFromAttributes(createPlayerDto);

    this.validateOverallAndPotential(overall, createPlayerDto.potential);
    await this.ensureTeamExists(createPlayerDto.teamId);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const createdPlayer = await tx.player.create({
          data: this.toCreateData(createPlayerDto, overall),
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
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
              },
            },
          },
        });

        if (createdPlayer.teamId) {
          await this.refreshTeamRating(createdPlayer.teamId, tx);
        }

        return this.mapPlayerResponse(createdPlayer);
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async updatePlayer(id: string, updatePlayerDto: UpdatePlayerDto) {
    const existingPlayer = await this.prisma.player.findUnique({
      where: { id },
      include: {
        physicalProfile: true,
        healthProfile: true,
        careerHistory: {
          where: { status: 'ACTIVE' },
          select: { id: true },
        },
      },
    });

    if (!existingPlayer) {
      throw new NotFoundException('Player not found');
    }

    const nextOverall = this.calculateOverallFromAttributes({
      position: updatePlayerDto.position ?? existingPlayer.position,
      shooting: updatePlayerDto.shooting ?? existingPlayer.shooting,
      passing: updatePlayerDto.passing ?? existingPlayer.passing,
      defense: updatePlayerDto.defense ?? existingPlayer.defense,
      rebounding: updatePlayerDto.rebounding ?? existingPlayer.rebounding,
      athleticism: updatePlayerDto.athleticism ?? existingPlayer.athleticism,
    });
    const nextPotential = updatePlayerDto.potential ?? existingPlayer.potential;

    this.validateOverallAndPotential(nextOverall, nextPotential);
    await this.ensureTeamExists(updatePlayerDto.teamId);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const updatedPlayer = await tx.player.update({
          where: { id },
          data: this.toUpdateData(updatePlayerDto, nextOverall, existingPlayer),
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
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
              },
            },
          },
        });

        if (existingPlayer.teamId !== updatedPlayer.teamId) {
          await this.recordCareerHistoryTransfer(tx, {
            playerId: updatedPlayer.id,
            nextTeamId: updatedPlayer.teamId,
          });
        }

        const affectedTeamIds = new Set<string>();

        if (existingPlayer.teamId) {
          affectedTeamIds.add(existingPlayer.teamId);
        }

        if (updatedPlayer.teamId) {
          affectedTeamIds.add(updatedPlayer.teamId);
        }

        for (const teamId of affectedTeamIds) {
          await this.refreshTeamRating(teamId, tx);
        }

        return this.mapPlayerResponse(updatedPlayer);
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  private async refreshTeamRating(teamId: string, tx: Prisma.TransactionClient) {
    const players = await tx.player.findMany({
      where: { teamId },
      select: {
        overall: true,
      },
      orderBy: [{ overall: 'desc' }, { name: 'asc' }],
    });

    const rating = this.calculateDerivedTeamRating(players);

    await tx.team.update({
      where: { id: teamId },
      data: { rating },
    });
  }

  private calculateDerivedTeamRating(players: Array<{ overall: number }>) {
    if (players.length === 0) {
      return DEFAULT_TEAM_RATING;
    }

    const totalOverall = players.reduce((sum, player) => sum + player.overall, 0);

    return Math.round(totalOverall / players.length);
  }

  private toCreateData(
    createPlayerDto: CreatePlayerDto,
    overall: number,
  ): Prisma.PlayerCreateInput {
    this.validateSecondaryPositions(createPlayerDto.position, createPlayerDto.secondaryPositions);

    return {
      name: createPlayerDto.name.trim(),
      age: createPlayerDto.age,
      dateOfBirth: this.resolveDateOfBirth(createPlayerDto.dateOfBirth, createPlayerDto.age),
      dominantHand: createPlayerDto.dominantHand,
      position: createPlayerDto.position,
      secondaryPositions: createPlayerDto.secondaryPositions ?? [],
      shooting: createPlayerDto.shooting,
      passing: createPlayerDto.passing,
      defense: createPlayerDto.defense,
      rebounding: createPlayerDto.rebounding,
      athleticism: createPlayerDto.athleticism,
      potential: createPlayerDto.potential,
      overall,
      team: createPlayerDto.teamId
        ? {
            connect: {
              id: createPlayerDto.teamId,
            },
          }
        : undefined,
      careerHistory: {
        create: [
          this.buildCareerHistoryCreateInput({
            teamId: createPlayerDto.teamId,
            status: createPlayerDto.teamId ? 'ACTIVE' : 'FREE_AGENT',
            transferReason: createPlayerDto.teamId
              ? 'Initial team assignment'
              : 'Created as free agent',
          }),
        ],
      },
      physicalProfile: {
        create: this.buildPhysicalProfileCreateInput(createPlayerDto),
      },
      healthProfile: {
        create: this.buildHealthProfileCreateInput(
          createPlayerDto.age,
          createPlayerDto.athleticism,
        ),
      },
      mentalAttributes: {
        create: this.buildMentalProfileCreateInput(),
      },
      hiddenAttributes: {
        create: this.buildHiddenProfileCreateInput(),
      },
      potentialProfile: {
        create: this.buildPotentialProfileCreateInput(
          createPlayerDto.potential,
          overall,
          createPlayerDto.age,
        ),
      },
      reputationProfile: {
        create: this.buildReputationProfileCreateInput(overall),
      },
      tacticalAttributes: {
        create: this.buildTacticalProfileCreateInput(),
      },
    };
  }

  private toUpdateData(
    updatePlayerDto: UpdatePlayerDto,
    overall: number,
    existingPlayer: {
      age: number;
      athleticism: number;
      defense: number;
      potential: number;
      rebounding: number;
      position: PlayerOverallInput['position'];
      teamId: string | null;
      physicalProfile: { id: string } | null;
      healthProfile: { id: string } | null;
    },
  ): Prisma.PlayerUpdateInput {
    const data: Prisma.PlayerUpdateInput = {};
    const nextPosition = updatePlayerDto.position ?? existingPlayer.position;
    const nextAge = updatePlayerDto.age ?? existingPlayer.age;
    const nextPotential = updatePlayerDto.potential ?? existingPlayer.potential;

    if (typeof updatePlayerDto.name === 'string') {
      data.name = updatePlayerDto.name.trim();
    }

    if (typeof updatePlayerDto.age === 'number') {
      data.age = updatePlayerDto.age;
    }

    if (typeof updatePlayerDto.dateOfBirth === 'string') {
      data.dateOfBirth = new Date(updatePlayerDto.dateOfBirth);
    }

    if (updatePlayerDto.dominantHand !== undefined) {
      data.dominantHand = updatePlayerDto.dominantHand;
    }

    if (updatePlayerDto.position) {
      data.position = updatePlayerDto.position;
    }

    if (updatePlayerDto.secondaryPositions !== undefined) {
      this.validateSecondaryPositions(nextPosition, updatePlayerDto.secondaryPositions);
      data.secondaryPositions = updatePlayerDto.secondaryPositions;
    }

    if (typeof updatePlayerDto.shooting === 'number') {
      data.shooting = updatePlayerDto.shooting;
    }

    if (typeof updatePlayerDto.passing === 'number') {
      data.passing = updatePlayerDto.passing;
    }

    if (typeof updatePlayerDto.defense === 'number') {
      data.defense = updatePlayerDto.defense;
    }

    if (typeof updatePlayerDto.rebounding === 'number') {
      data.rebounding = updatePlayerDto.rebounding;
    }

    if (typeof updatePlayerDto.athleticism === 'number') {
      data.athleticism = updatePlayerDto.athleticism;
    }

    if (typeof updatePlayerDto.potential === 'number') {
      data.potential = updatePlayerDto.potential;
    }

    data.overall = overall;
    data.potentialProfile = {
      upsert: {
        create: this.buildPotentialProfileCreateInput(nextPotential, overall, nextAge),
        update: this.buildPotentialProfileUpdateInput(nextPotential, overall, nextAge),
      },
    };
    data.reputationProfile = {
      upsert: {
        create: this.buildReputationProfileCreateInput(overall),
        update: this.buildReputationProfileUpdateInput(overall),
      },
    };

    if (
      updatePlayerDto.heightCm !== undefined ||
      updatePlayerDto.weightKg !== undefined ||
      updatePlayerDto.wingspanCm !== undefined ||
      updatePlayerDto.bodyType !== undefined ||
      updatePlayerDto.position !== undefined ||
      !existingPlayer.physicalProfile
    ) {
      data.physicalProfile = {
        upsert: {
          create: this.buildPhysicalProfileCreateInput({
            age: nextAge,
            athleticism: updatePlayerDto.athleticism ?? existingPlayer.athleticism,
            defense: updatePlayerDto.defense ?? existingPlayer.defense,
            rebounding: updatePlayerDto.rebounding ?? existingPlayer.rebounding,
            position: nextPosition,
            heightCm: updatePlayerDto.heightCm,
            weightKg: updatePlayerDto.weightKg,
            wingspanCm: updatePlayerDto.wingspanCm,
            bodyType: updatePlayerDto.bodyType,
          }),
          update: this.buildPhysicalProfileUpdateInput(updatePlayerDto, nextPosition),
        },
      };
    }

    if (!existingPlayer.healthProfile) {
      data.healthProfile = {
        create: this.buildHealthProfileCreateInput(
          updatePlayerDto.age ?? existingPlayer.age,
          updatePlayerDto.athleticism ?? existingPlayer.athleticism,
        ),
      };
    }

    if (typeof updatePlayerDto.teamId === 'string') {
      data.team = {
        connect: {
          id: updatePlayerDto.teamId,
        },
      };
    } else if (updatePlayerDto.teamId === null && existingPlayer.teamId) {
      data.team = {
        disconnect: true,
      };
    }

    return data;
  }

  private validateOverallAndPotential(overall: number, potential: number) {
    if (overall > potential) {
      throw new UnprocessableEntityException(
        'Player overall must be less than or equal to potential',
      );
    }
  }

  private calculateOverallFromAttributes(player: PlayerOverallInput) {
    return calculatePlayerOverall(player);
  }

  private buildMentalProfileCreateInput(): Prisma.PlayerMentalAttributesCreateWithoutPlayerInput {
    return {
      confidence: 72,
      selfControl: 70,
      concentration: 71,
      composure: 70,
      determination: 74,
      workEthic: 76,
      professionalism: 72,
      leadership: 66,
      aggressiveness: 64,
      competitiveness: 73,
      teamwork: 75,
      teamOrientation: 75,
      loyalty: 68,
      ego: 55,
      clutchFactor: 67,
    };
  }

  private buildHiddenProfileCreateInput(): Prisma.PlayerHiddenAttributesCreateWithoutPlayerInput {
    return {
      consistency: 69,
      injuryProneness: 45,
      importantMatches: 70,
      wantsToLeave: 28,
      declineResistance: 64,
      adaptability: 71,
      discipline: 70,
      ambition: 76,
      resilience: 72,
      pressureHandling: 68,
      setbackResponse: 72,
    };
  }

  private buildPotentialProfileCreateInput(
    potential: number,
    currentAbility: number,
    age: number,
  ): Prisma.PlayerPotentialProfileCreateWithoutPlayerInput {
    const peakWindowStart = Math.max(22, Math.min(26, age - 1));
    const peakWindowEnd = Math.max(peakWindowStart + 3, Math.min(32, age + 5));
    const declineStartAge = Math.max(peakWindowEnd + 1, Math.min(36, peakWindowEnd + 3));

    return {
      potential,
      potentialAbility: potential,
      currentAbility,
      growthRate: this.clampAttribute(72 + Math.max(0, potential - currentAbility) / 4),
      developmentFocus: 'BALANCED',
      peakStartAge: peakWindowStart,
      peakEndAge: peakWindowEnd,
      declineStartAge,
      learningAbility: 74,
      peakWindowStart,
      peakWindowEnd,
      ceilingTier: this.clampAttribute(Math.round((potential + currentAbility) / 2)),
      readiness: this.clampAttribute(Math.round((currentAbility * 0.7 + potential * 0.3) / 1)),
    };
  }

  private buildHealthProfileCreateInput(
    age: number,
    athleticism: number,
  ): Prisma.PlayerHealthProfileCreateWithoutPlayerInput {
    const agePenalty = Math.max(0, age - 29);
    const durability = this.clampAttribute(72 + Math.round(athleticism / 8) - agePenalty);
    const recoveryRate = this.clampAttribute(74 + Math.round(athleticism / 10) - agePenalty);
    const injuryRisk = this.clampAttribute(32 + agePenalty + Math.round((100 - athleticism) / 8));

    return {
      overallCondition: this.clampAttribute(82 + Math.round(athleticism / 10)),
      fatigue: 18,
      postInjuryCondition: 100,
      durability,
      recoveryRate,
      injuryRisk,
      fatigueBase: 20,
      matchFitness: this.clampAttribute(80 + Math.round(athleticism / 12)),
      painTolerance: this.clampAttribute(68 + Math.round(athleticism / 10)),
      medicalOutlook: 72,
    };
  }

  private buildPotentialProfileUpdateInput(
    potential: number,
    currentAbility: number,
    age: number,
  ): Prisma.PlayerPotentialProfileUpdateWithoutPlayerInput {
    const peakWindowStart = Math.max(22, Math.min(26, age - 1));
    const peakWindowEnd = Math.max(peakWindowStart + 3, Math.min(32, age + 5));
    const declineStartAge = Math.max(peakWindowEnd + 1, Math.min(36, peakWindowEnd + 3));

    return {
      potential,
      potentialAbility: potential,
      currentAbility,
      growthRate: this.clampAttribute(72 + Math.max(0, potential - currentAbility) / 4),
      peakStartAge: peakWindowStart,
      peakEndAge: peakWindowEnd,
      declineStartAge,
      ceilingTier: this.clampAttribute(Math.round((potential + currentAbility) / 2)),
      readiness: this.clampAttribute(Math.round(currentAbility * 0.7 + potential * 0.3)),
    };
  }

  private buildReputationProfileCreateInput(
    overall: number,
  ): Prisma.PlayerReputationProfileCreateWithoutPlayerInput {
    const reputation = this.clampAttribute(Math.round(overall * 0.88));
    const starPower = this.clampAttribute(Math.round(overall * 0.84));
    const fanAppeal = this.clampAttribute(Math.round(overall * 0.82));
    const mediaAppeal = this.clampAttribute(Math.round((starPower + fanAppeal) / 2));

    return {
      reputation,
      hiddenReputation: reputation,
      leagueReputation: this.clampAttribute(reputation - 2),
      internationalReputation: this.clampAttribute(reputation - 8),
      starPower,
      fanAppeal,
      mediaHandling: this.clampAttribute(66 + Math.round(overall / 8)),
      mediaAppeal,
      agentInfluence: this.clampAttribute(52 + Math.round(overall / 10)),
    };
  }

  private buildReputationProfileUpdateInput(
    overall: number,
  ): Prisma.PlayerReputationProfileUpdateWithoutPlayerInput {
    const reputation = this.clampAttribute(Math.round(overall * 0.88));
    const starPower = this.clampAttribute(Math.round(overall * 0.84));
    const fanAppeal = this.clampAttribute(Math.round(overall * 0.82));

    return {
      reputation,
      hiddenReputation: reputation,
      leagueReputation: this.clampAttribute(reputation - 2),
      internationalReputation: this.clampAttribute(reputation - 8),
      starPower,
      fanAppeal,
      mediaHandling: this.clampAttribute(66 + Math.round(overall / 8)),
      mediaAppeal: this.clampAttribute(Math.round((starPower + fanAppeal) / 2)),
      agentInfluence: this.clampAttribute(52 + Math.round(overall / 10)),
    };
  }

  private buildTacticalProfileCreateInput(): Prisma.PlayerTacticalAttributesCreateWithoutPlayerInput {
    return {
      basketballIQ: 74,
      courtVision: 73,
      defenseReading: 70,
      offenseReading: 72,
      decisionMaking: 72,
      shotSelection: 71,
      offBallMovement: 70,
      spacing: 71,
      pickAndRollOffense: 70,
      pickAndRollDefense: 69,
      helpDefense: 70,
      discipline: 74,
      helpDefenseAwareness: 70,
      offBallAwareness: 70,
      pickAndRollRead: 70,
      spacingSense: 71,
      playDiscipline: 74,
      foulDiscipline: 73,
      transitionInstincts: 71,
    };
  }

  private buildPhysicalProfileCreateInput(input: {
    age: number;
    athleticism: number;
    defense: number;
    rebounding: number;
    position: PlayerOverallInput['position'];
    heightCm?: number;
    weightKg?: number;
    wingspanCm?: number;
    bodyType?: Prisma.PlayerPhysicalProfileCreateWithoutPlayerInput['bodyType'];
  }): Prisma.PlayerPhysicalProfileCreateWithoutPlayerInput {
    const defaults = this.getPhysicalDefaults(input.position, input.bodyType);
    const heightCm = input.heightCm ?? defaults.heightCm;
    const weightKg = input.weightKg ?? defaults.weightKg;
    const wingspanCm = input.wingspanCm ?? defaults.wingspanCm;

    return {
      heightCm,
      weightKg,
      wingspanCm,
      bodyType: input.bodyType ?? defaults.bodyType,
      standingReachCm: defaults.standingReachCm,
      speed: this.clampAttribute(input.athleticism + defaults.speedOffset),
      acceleration: this.clampAttribute(input.athleticism + defaults.accelerationOffset),
      strength: this.clampAttribute(
        Math.round((input.defense + input.rebounding) / 2) + defaults.strengthOffset,
      ),
      explosiveness: this.clampAttribute(input.athleticism + defaults.explosivenessOffset),
      agility: this.clampAttribute(input.athleticism + defaults.agilityOffset),
      balance: this.clampAttribute(input.athleticism + defaults.balanceOffset),
      coordination: this.clampAttribute(input.athleticism + defaults.coordinationOffset),
      reaction: this.clampAttribute(input.athleticism + defaults.reactionOffset),
      vertical: this.clampAttribute(input.athleticism + defaults.verticalOffset),
      stamina: this.clampAttribute(input.athleticism + defaults.staminaOffset),
      endurance: this.clampAttribute(input.athleticism + defaults.enduranceOffset),
      recovery: this.clampAttribute(70 + defaults.recoveryOffset),
      durability: this.clampAttribute(68 + Math.max(0, input.age - 24) + defaults.durabilityOffset),
    };
  }

  private buildPhysicalProfileUpdateInput(
    updatePlayerDto: UpdatePlayerDto,
    position: PlayerOverallInput['position'],
  ): Prisma.PlayerPhysicalProfileUpdateWithoutPlayerInput {
    const defaults = this.getPhysicalDefaults(position, updatePlayerDto.bodyType);
    const data: Prisma.PlayerPhysicalProfileUpdateWithoutPlayerInput = {};

    if (typeof updatePlayerDto.heightCm === 'number') {
      data.heightCm = updatePlayerDto.heightCm;
    }

    if (typeof updatePlayerDto.weightKg === 'number') {
      data.weightKg = updatePlayerDto.weightKg;
    }

    if (typeof updatePlayerDto.wingspanCm === 'number') {
      data.wingspanCm = updatePlayerDto.wingspanCm;
    }

    if (updatePlayerDto.bodyType !== undefined) {
      data.bodyType = updatePlayerDto.bodyType;
    }

    if (updatePlayerDto.position !== undefined) {
      data.standingReachCm = defaults.standingReachCm;
    }

    return data;
  }

  private resolveDateOfBirth(dateOfBirth: string | undefined, age: number) {
    if (dateOfBirth) {
      return new Date(dateOfBirth);
    }

    return new Date(Date.UTC(new Date().getUTCFullYear() - age, 6, 1));
  }

  private validateSecondaryPositions(
    primaryPosition: PlayerOverallInput['position'],
    secondaryPositions: PlayerOverallInput['position'][] | undefined,
  ) {
    if (!secondaryPositions?.length) {
      return;
    }

    if (secondaryPositions.includes(primaryPosition)) {
      throw new UnprocessableEntityException(
        'Secondary positions must not contain the primary position',
      );
    }
  }

  private getPhysicalDefaults(
    position: PlayerOverallInput['position'],
    bodyType?: Prisma.PlayerPhysicalProfileCreateWithoutPlayerInput['bodyType'],
  ) {
    const defaultBodyType =
      bodyType ??
      (
        {
          PG: 'SLIM',
          SG: 'ATHLETIC',
          SF: 'ATHLETIC',
          PF: 'STRONG',
          C: 'HEAVY',
        } as const
      )[position];

    const defaultsByPosition = {
      PG: {
        heightCm: 185,
        weightKg: 82,
        wingspanCm: 192,
        standingReachCm: 238,
        speedOffset: 6,
        accelerationOffset: 8,
        strengthOffset: -2,
        explosivenessOffset: 7,
        agilityOffset: 7,
        balanceOffset: 5,
        coordinationOffset: 6,
        reactionOffset: 7,
        verticalOffset: 5,
        staminaOffset: 3,
        enduranceOffset: 2,
        recoveryOffset: 2,
        durabilityOffset: -2,
      },
      SG: {
        heightCm: 191,
        weightKg: 88,
        wingspanCm: 199,
        standingReachCm: 246,
        speedOffset: 4,
        accelerationOffset: 5,
        strengthOffset: 0,
        explosivenessOffset: 5,
        agilityOffset: 4,
        balanceOffset: 4,
        coordinationOffset: 4,
        reactionOffset: 5,
        verticalOffset: 4,
        staminaOffset: 2,
        enduranceOffset: 2,
        recoveryOffset: 1,
        durabilityOffset: -1,
      },
      SF: {
        heightCm: 198,
        weightKg: 94,
        wingspanCm: 206,
        standingReachCm: 255,
        speedOffset: 2,
        accelerationOffset: 2,
        strengthOffset: 2,
        explosivenessOffset: 3,
        agilityOffset: 2,
        balanceOffset: 3,
        coordinationOffset: 2,
        reactionOffset: 3,
        verticalOffset: 2,
        staminaOffset: 1,
        enduranceOffset: 1,
        recoveryOffset: 1,
        durabilityOffset: 0,
      },
      PF: {
        heightCm: 205,
        weightKg: 104,
        wingspanCm: 214,
        standingReachCm: 266,
        speedOffset: 0,
        accelerationOffset: -1,
        strengthOffset: 5,
        explosivenessOffset: 1,
        agilityOffset: -1,
        balanceOffset: 2,
        coordinationOffset: 0,
        reactionOffset: 1,
        verticalOffset: 1,
        staminaOffset: 0,
        enduranceOffset: 0,
        recoveryOffset: 0,
        durabilityOffset: 2,
      },
      C: {
        heightCm: 211,
        weightKg: 112,
        wingspanCm: 221,
        standingReachCm: 276,
        speedOffset: -2,
        accelerationOffset: -3,
        strengthOffset: 7,
        explosivenessOffset: 0,
        agilityOffset: -3,
        balanceOffset: 1,
        coordinationOffset: -1,
        reactionOffset: 0,
        verticalOffset: 0,
        staminaOffset: -1,
        enduranceOffset: 0,
        recoveryOffset: 0,
        durabilityOffset: 3,
      },
    } as const;

    return {
      ...defaultsByPosition[position],
      bodyType: defaultBodyType,
    };
  }

  private buildCareerHistoryCreateInput(params: {
    teamId?: string | null;
    status: PlayerCareerStatus;
    transferReason: string;
    transferDate?: Date;
  }): Prisma.PlayerCareerHistoryCreateWithoutPlayerInput {
    return {
      seasonLabel: this.getCurrentSeasonLabel(params.transferDate),
      league: 'VTB United League',
      role: params.teamId ? 'Roster' : 'Free Agent',
      jerseyNumber: null,
      status: params.status,
      transferDate: params.transferDate ?? new Date(),
      transferReason: params.transferReason,
      achievements: [],
      team: params.teamId
        ? {
            connect: { id: params.teamId },
          }
        : undefined,
    };
  }

  private async recordCareerHistoryTransfer(
    tx: Prisma.TransactionClient,
    params: { playerId: string; nextTeamId: string | null },
  ) {
    await tx.playerCareerHistory.updateMany({
      where: {
        playerId: params.playerId,
        status: 'ACTIVE',
      },
      data: {
        status: 'FORMER',
      },
    });

    await tx.playerCareerHistory.create({
      data: {
        player: {
          connect: { id: params.playerId },
        },
        ...this.buildCareerHistoryCreateInput({
          teamId: params.nextTeamId,
          status: params.nextTeamId ? 'ACTIVE' : 'FREE_AGENT',
          transferReason: params.nextTeamId ? 'Transferred to new team' : 'Released to free agency',
        }),
      },
    });
  }

  private getCurrentSeasonLabel(referenceDate = new Date()) {
    const year = referenceDate.getUTCFullYear();
    const month = referenceDate.getUTCMonth() + 1;
    const startYear = month >= 7 ? year : year - 1;
    const endYearShort = String((startYear + 1) % 100).padStart(2, '0');

    return `${startYear}/${endYearShort}`;
  }

  private roundStat(value: number, digits = 1) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  private calculateCareerTotals(
    seasonStats:
      | Array<{
          gamesPlayed: number;
          gamesStarted: number;
          minutesPerGame: number;
          pointsPerGame: number;
          reboundsPerGame: number;
          assistsPerGame: number;
          stealsPerGame: number;
          blocksPerGame: number;
          turnoversPerGame: number;
          foulsPerGame: number;
          fgPct: number;
          threePct: number;
          ftPct: number;
          efficiencyRating: number;
        }>
      | undefined,
  ) {
    if (!seasonStats?.length) {
      return null;
    }

    const totals = seasonStats.reduce(
      (acc, entry) => {
        const gp = entry.gamesPlayed;

        acc.seasonsCount += 1;
        acc.gamesPlayed += gp;
        acc.gamesStarted += entry.gamesStarted;
        acc.totalMinutes += entry.minutesPerGame * gp;
        acc.totalPoints += entry.pointsPerGame * gp;
        acc.totalRebounds += entry.reboundsPerGame * gp;
        acc.totalAssists += entry.assistsPerGame * gp;
        acc.totalSteals += entry.stealsPerGame * gp;
        acc.totalBlocks += entry.blocksPerGame * gp;
        acc.totalTurnovers += entry.turnoversPerGame * gp;
        acc.totalFouls += entry.foulsPerGame * gp;
        acc.weightedFgPct += entry.fgPct * gp;
        acc.weightedThreePct += entry.threePct * gp;
        acc.weightedFtPct += entry.ftPct * gp;
        acc.weightedEfficiency += entry.efficiencyRating * gp;

        return acc;
      },
      {
        seasonsCount: 0,
        gamesPlayed: 0,
        gamesStarted: 0,
        totalMinutes: 0,
        totalPoints: 0,
        totalRebounds: 0,
        totalAssists: 0,
        totalSteals: 0,
        totalBlocks: 0,
        totalTurnovers: 0,
        totalFouls: 0,
        weightedFgPct: 0,
        weightedThreePct: 0,
        weightedFtPct: 0,
        weightedEfficiency: 0,
      },
    );

    const gp = Math.max(1, totals.gamesPlayed);

    return {
      seasonsCount: totals.seasonsCount,
      gamesPlayed: totals.gamesPlayed,
      gamesStarted: totals.gamesStarted,
      totalMinutes: this.roundStat(totals.totalMinutes),
      totalPoints: this.roundStat(totals.totalPoints),
      totalRebounds: this.roundStat(totals.totalRebounds),
      totalAssists: this.roundStat(totals.totalAssists),
      totalSteals: this.roundStat(totals.totalSteals),
      totalBlocks: this.roundStat(totals.totalBlocks),
      totalTurnovers: this.roundStat(totals.totalTurnovers),
      totalFouls: this.roundStat(totals.totalFouls),
      averageMinutesPerGame: this.roundStat(totals.totalMinutes / gp),
      averagePointsPerGame: this.roundStat(totals.totalPoints / gp),
      averageReboundsPerGame: this.roundStat(totals.totalRebounds / gp),
      averageAssistsPerGame: this.roundStat(totals.totalAssists / gp),
      averageStealsPerGame: this.roundStat(totals.totalSteals / gp),
      averageBlocksPerGame: this.roundStat(totals.totalBlocks / gp),
      averageTurnoversPerGame: this.roundStat(totals.totalTurnovers / gp),
      averageFoulsPerGame: this.roundStat(totals.totalFouls / gp),
      fgPct: this.roundStat(totals.weightedFgPct / gp),
      threePct: this.roundStat(totals.weightedThreePct / gp),
      ftPct: this.roundStat(totals.weightedFtPct / gp),
      efficiencyRating: this.roundStat(totals.weightedEfficiency / gp),
    };
  }

  private clampAttribute(value: number) {
    return Math.max(1, Math.min(100, value));
  }

  private mapPlayerResponse(player: {
    id: string;
    name: string;
    age: number;
    dateOfBirth: Date | null;
    dominantHand: string | null;
    position: PlayerOverallInput['position'];
    secondaryPositions: PlayerOverallInput['position'][];
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
    team?: {
      id: string;
      name: string;
      shortName: string;
    } | null;
    careerHistory?: Array<{
      id: string;
      seasonLabel: string;
      league: string;
      role: string;
      jerseyNumber: number | null;
      status: PlayerCareerStatus;
      transferDate: Date | null;
      transferReason: string | null;
      achievements: string[];
      team: {
        id: string;
        name: string;
        shortName: string;
      } | null;
    }>;
    seasonStats?: Array<{
      id: string;
      seasonLabel: string;
      league: string;
      gamesPlayed: number;
      gamesStarted: number;
      minutesPerGame: number;
      pointsPerGame: number;
      reboundsPerGame: number;
      assistsPerGame: number;
      stealsPerGame: number;
      blocksPerGame: number;
      turnoversPerGame: number;
      foulsPerGame: number;
      fgPct: number;
      threePct: number;
      ftPct: number;
      efficiencyRating: number;
      team: {
        id: string;
        name: string;
        shortName: string;
      } | null;
    }>;
    awards?: Array<{
      id: string;
      seasonLabel: string;
      awardType: string;
      league: string;
      description: string | null;
      team: {
        id: string;
        name: string;
        shortName: string;
      } | null;
    }>;
  }) {
    return {
      ...player,
      dateOfBirth: player.dateOfBirth?.toISOString() ?? null,
      createdAt: player.createdAt.toISOString(),
      updatedAt: player.updatedAt.toISOString(),
      careerHistory: player.careerHistory?.map((entry) => ({
        id: entry.id,
        season: entry.seasonLabel,
        league: entry.league,
        role: entry.role,
        jerseyNumber: entry.jerseyNumber,
        status: entry.status,
        transferDate: entry.transferDate?.toISOString() ?? null,
        transferReason: entry.transferReason,
        achievements: entry.achievements,
        team: entry.team,
      })),
      seasonStats: player.seasonStats?.map((entry) => ({
        id: entry.id,
        season: entry.seasonLabel,
        league: entry.league,
        team: entry.team,
        gamesPlayed: entry.gamesPlayed,
        gamesStarted: entry.gamesStarted,
        minutesPerGame: entry.minutesPerGame,
        pointsPerGame: entry.pointsPerGame,
        reboundsPerGame: entry.reboundsPerGame,
        assistsPerGame: entry.assistsPerGame,
        stealsPerGame: entry.stealsPerGame,
        blocksPerGame: entry.blocksPerGame,
        turnoversPerGame: entry.turnoversPerGame,
        foulsPerGame: entry.foulsPerGame,
        fgPct: entry.fgPct,
        threePct: entry.threePct,
        ftPct: entry.ftPct,
        efficiencyRating: entry.efficiencyRating,
      })),
      awards: player.awards?.map((entry) => ({
        id: entry.id,
        season: entry.seasonLabel,
        awardType: entry.awardType,
        league: entry.league,
        description: entry.description,
        team: entry.team,
      })),
      careerTotals: this.calculateCareerTotals(player.seasonStats),
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
    };
  }

  private mapPlayerHiddenProfile(player: {
    mentalAttributes: {
      professionalism: number;
      loyalty: number;
      ego: number;
    } | null;
    hiddenAttributes: {
      consistency: number;
      injuryProneness: number;
      importantMatches: number;
      wantsToLeave: number;
      ambition: number;
      adaptability: number;
      pressureHandling: number;
      setbackResponse: number;
    } | null;
    potentialProfile: {
      potential: number;
      potentialAbility: number;
      currentAbility: number;
      growthRate: number;
      developmentFocus: PlayerDevelopmentFocus;
      peakStartAge: number;
      peakEndAge: number;
      declineStartAge: number;
      learningAbility: number;
    } | null;
    reputationProfile: {
      mediaAppeal: number;
      agentInfluence: number;
      hiddenReputation: number;
    } | null;
  }) {
    if (
      !player.mentalAttributes ||
      !player.hiddenAttributes ||
      !player.potentialProfile ||
      !player.reputationProfile
    ) {
      throw new NotFoundException('Player hidden profile not found');
    }

    return {
      potential: player.potentialProfile.potential,
      potentialAbility: player.potentialProfile.potentialAbility,
      currentAbility: player.potentialProfile.currentAbility,
      growthRate: player.potentialProfile.growthRate,
      developmentFocus: player.potentialProfile.developmentFocus,
      peakStartAge: player.potentialProfile.peakStartAge,
      peakEndAge: player.potentialProfile.peakEndAge,
      declineStartAge: player.potentialProfile.declineStartAge,
      professionalism: player.mentalAttributes.professionalism,
      loyalty: player.mentalAttributes.loyalty,
      consistency: player.hiddenAttributes.consistency,
      injuryProneness: player.hiddenAttributes.injuryProneness,
      importantMatches: player.hiddenAttributes.importantMatches,
      mediaAppeal: player.reputationProfile.mediaAppeal,
      ego: player.mentalAttributes.ego,
      wantsToLeave: player.hiddenAttributes.wantsToLeave,
      agentInfluence: player.reputationProfile.agentInfluence,
      learningAbility: player.potentialProfile.learningAbility,
      hiddenReputation: player.reputationProfile.hiddenReputation,
    };
  }

  private async ensureTeamExists(teamId?: string | null) {
    if (!teamId) {
      return;
    }

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }
  }

  private handlePersistenceError(_error: unknown): never {
    throw new UnprocessableEntityException('Player data is invalid');
  }
}
