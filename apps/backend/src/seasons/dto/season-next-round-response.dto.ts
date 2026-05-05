import { ApiProperty } from '@nestjs/swagger';
import { SeasonStatus } from '@prisma/client';

export class SeasonNextRoundResponseDto {
  @ApiProperty({ example: 'season_2026' })
  seasonId!: string;

  @ApiProperty({ example: 12, minimum: 1 })
  previousRound!: number;

  @ApiProperty({ example: 13, minimum: 1 })
  currentRound!: number;

  @ApiProperty({ enum: SeasonStatus, example: SeasonStatus.IN_PROGRESS })
  seasonStatus!: SeasonStatus;
}
