import { ApiProperty } from '@nestjs/swagger';
import { SeasonStatus } from '@prisma/client';
import { SeasonChampionDto } from './season-standings-response.dto';

export class SeasonFullSimulationRoundDto {
  @ApiProperty({ example: 1, minimum: 1 })
  round!: number;

  @ApiProperty({ example: 1, minimum: 0 })
  matchesSimulated!: number;
}

export class SeasonFullSimulationResponseDto {
  @ApiProperty({ example: 'season_2026' })
  seasonId!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  startedFromRound!: number;

  @ApiProperty({ example: 12, minimum: 1 })
  completedAtRound!: number;

  @ApiProperty({ example: 12, minimum: 0 })
  simulatedMatches!: number;

  @ApiProperty({ example: 12, minimum: 0 })
  simulatedRoundCount!: number;

  @ApiProperty({ type: [SeasonFullSimulationRoundDto] })
  simulatedRounds!: SeasonFullSimulationRoundDto[];

  @ApiProperty({ enum: SeasonStatus, example: SeasonStatus.COMPLETED })
  seasonStatus!: SeasonStatus;

  @ApiProperty({ example: '2026-05-03T11:00:00.000Z', nullable: true })
  finishedAt!: string | null;

  @ApiProperty({ type: SeasonChampionDto, nullable: true })
  champion!: SeasonChampionDto | null;
}
