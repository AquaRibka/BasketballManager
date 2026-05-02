import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeams() {
    const items = await this.prisma.team.findMany({
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
          orderBy: [{ overall: 'desc' }, { name: 'asc' }],
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async getTeamPlayers(id: string) {
    await this.ensureTeamExists(id);

    const items = await this.prisma.player.findMany({
      where: {
        teamId: id,
      },
      orderBy: [{ position: 'asc' }, { overall: 'desc' }, { name: 'asc' }],
    });

    return {
      teamId: id,
      items,
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
}
