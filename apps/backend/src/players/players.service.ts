import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

const DEFAULT_TEAM_RATING = 60;

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlayers() {
    const items = await this.prisma.player.findMany({
      include: {
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
      items,
      total: items.length,
    };
  }

  async getPlayerById(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
      },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return player;
  }

  async createPlayer(createPlayerDto: CreatePlayerDto) {
    this.validateOverallAndPotential(createPlayerDto.overall, createPlayerDto.potential);
    await this.ensureTeamExists(createPlayerDto.teamId);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const createdPlayer = await tx.player.create({
          data: this.toCreateData(createPlayerDto),
          include: {
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

        return createdPlayer;
      });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async updatePlayer(id: string, updatePlayerDto: UpdatePlayerDto) {
    const existingPlayer = await this.prisma.player.findUnique({
      where: { id },
    });

    if (!existingPlayer) {
      throw new NotFoundException('Player not found');
    }

    const nextOverall = updatePlayerDto.overall ?? existingPlayer.overall;
    const nextPotential = updatePlayerDto.potential ?? existingPlayer.potential;

    this.validateOverallAndPotential(nextOverall, nextPotential);
    await this.ensureTeamExists(updatePlayerDto.teamId);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const updatedPlayer = await tx.player.update({
          where: { id },
          data: this.toUpdateData(updatePlayerDto),
          include: {
            team: {
              select: {
                id: true,
                name: true,
                shortName: true,
              },
            },
          },
        });

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

        return updatedPlayer;
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

  private toCreateData(createPlayerDto: CreatePlayerDto): Prisma.PlayerCreateInput {
    return {
      name: createPlayerDto.name.trim(),
      age: createPlayerDto.age,
      position: createPlayerDto.position,
      shooting: createPlayerDto.shooting,
      passing: createPlayerDto.passing,
      defense: createPlayerDto.defense,
      rebounding: createPlayerDto.rebounding,
      athleticism: createPlayerDto.athleticism,
      potential: createPlayerDto.potential,
      overall: createPlayerDto.overall,
      team: createPlayerDto.teamId
        ? {
            connect: {
              id: createPlayerDto.teamId,
            },
          }
        : undefined,
    };
  }

  private toUpdateData(updatePlayerDto: UpdatePlayerDto): Prisma.PlayerUpdateInput {
    const data: Prisma.PlayerUpdateInput = {};

    if (typeof updatePlayerDto.name === 'string') {
      data.name = updatePlayerDto.name.trim();
    }

    if (typeof updatePlayerDto.age === 'number') {
      data.age = updatePlayerDto.age;
    }

    if (updatePlayerDto.position) {
      data.position = updatePlayerDto.position;
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

    if (typeof updatePlayerDto.overall === 'number') {
      data.overall = updatePlayerDto.overall;
    }

    if (typeof updatePlayerDto.teamId === 'string') {
      data.team = {
        connect: {
          id: updatePlayerDto.teamId,
        },
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
