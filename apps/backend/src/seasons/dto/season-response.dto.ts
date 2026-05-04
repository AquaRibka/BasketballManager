import { ApiProperty } from '@nestjs/swagger';
import { SeasonStatus } from '@prisma/client';

export class SeasonResponseDto {
  @ApiProperty({ example: 'season_2026' })
  id!: string;

  @ApiProperty({ example: 'VTB League MVP 2026' })
  name!: string;

  @ApiProperty({ example: 2026, minimum: 2000, maximum: 9999 })
  year!: number;

  @ApiProperty({ enum: SeasonStatus, example: SeasonStatus.IN_PROGRESS })
  status!: SeasonStatus;

  @ApiProperty({ example: 1, minimum: 1 })
  currentRound!: number;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  startedAt!: string;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  updatedAt!: string;

  @ApiProperty({ example: null, nullable: true })
  finishedAt!: string | null;
}
