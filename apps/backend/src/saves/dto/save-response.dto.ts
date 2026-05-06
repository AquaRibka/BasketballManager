import { ApiProperty } from '@nestjs/swagger';
import { MatchStatus, SeasonStatus } from '@prisma/client';
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

export class CareerSaveMatchTeamDto {
  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  id!: string;

  @ApiProperty({ example: 'CSKA Moscow' })
  name!: string;

  @ApiProperty({ example: 'CSKA' })
  shortName!: string;
}

export class CareerSaveMatchDto {
  @ApiProperty({ example: 'cmatch000000000000000001' })
  id!: string;

  @ApiProperty({ example: 'season_2026', nullable: true })
  seasonId!: string | null;

  @ApiProperty({ example: 1, nullable: true })
  round!: number | null;

  @ApiProperty({ enum: MatchStatus, example: MatchStatus.SCHEDULED })
  status!: MatchStatus;

  @ApiProperty({ example: '2026-10-01T18:00:00.000Z', nullable: true })
  date!: string | null;

  @ApiProperty({ example: null, nullable: true })
  homeScore!: number | null;

  @ApiProperty({ example: null, nullable: true })
  awayScore!: number | null;

  @ApiProperty({ example: null, nullable: true })
  winnerTeamId!: string | null;

  @ApiProperty({ example: null, nullable: true })
  playedAt!: string | null;

  @ApiProperty({ type: CareerSaveMatchTeamDto })
  homeTeam!: CareerSaveMatchTeamDto;

  @ApiProperty({ type: CareerSaveMatchTeamDto })
  awayTeam!: CareerSaveMatchTeamDto;
}

export class CareerSaveScheduleRoundDto {
  @ApiProperty({ example: 1 })
  round!: number;

  @ApiProperty({ enum: MatchStatus, example: MatchStatus.SCHEDULED })
  status!: MatchStatus;

  @ApiProperty({ type: [CareerSaveMatchDto] })
  matches!: CareerSaveMatchDto[];
}

export class CareerSaveScheduleDto extends SeasonScheduleResponseDto {
  @ApiProperty({ type: [CareerSaveScheduleRoundDto] })
  override rounds!: CareerSaveScheduleRoundDto[];
}

export class CareerSaveStateResponseDto {
  @ApiProperty({ type: CareerSaveResponseDto })
  save!: CareerSaveResponseDto;

  @ApiProperty({ type: CareerSaveSeasonDto })
  season!: CareerSaveSeasonDto;

  @ApiProperty({ type: CareerSaveScheduleDto })
  schedule!: CareerSaveScheduleDto;

  @ApiProperty({ type: SeasonStandingsResponseDto })
  standings!: SeasonStandingsResponseDto;
}

export class CreateCareerSaveResponseDto extends CareerSaveStateResponseDto {}
