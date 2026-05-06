import { ApiProperty } from '@nestjs/swagger';
import { SeasonStatus } from '@prisma/client';
import { SeasonScheduleResponseDto } from '../../seasons/dto/season-schedule-response.dto';
import { SeasonStandingsResponseDto } from '../../seasons/dto/season-standings-response.dto';

export class CareerSaveResponseDto {
  @ApiProperty({ example: 'save_1' })
  id!: string;

  @ApiProperty({ example: 'My Career' })
  name!: string;

  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  teamId!: string;

  @ApiProperty({ example: 'CSKA Moscow' })
  teamName!: string;

  @ApiProperty({ example: 'season_2026' })
  seasonId!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  currentRound!: number;

  @ApiProperty({ example: 'ACTIVE' })
  status!: 'ACTIVE';

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  updatedAt!: string;
}

export class CareerSaveSeasonDto {
  @ApiProperty({ example: 'season_2026' })
  id!: string;

  @ApiProperty({ example: 'VTB League MVP 2026' })
  name!: string;

  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ enum: SeasonStatus, example: SeasonStatus.IN_PROGRESS })
  status!: SeasonStatus;

  @ApiProperty({ example: 1, minimum: 1 })
  currentRound!: number;

  @ApiProperty({ example: 20 })
  totalRounds!: number;

  @ApiProperty({ example: 11 })
  teamCount!: number;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  startedAt!: string;

  @ApiProperty({ example: null, nullable: true })
  finishedAt!: string | null;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
  updatedAt!: string;
}

export class CreateCareerSaveResponseDto {
  @ApiProperty({ type: CareerSaveResponseDto })
  save!: CareerSaveResponseDto;

  @ApiProperty({ type: CareerSaveSeasonDto })
  season!: CareerSaveSeasonDto;

  @ApiProperty({ type: SeasonScheduleResponseDto })
  schedule!: SeasonScheduleResponseDto;

  @ApiProperty({ type: SeasonStandingsResponseDto })
  standings!: SeasonStandingsResponseDto;
}
