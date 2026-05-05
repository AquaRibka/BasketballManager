import { ApiProperty } from '@nestjs/swagger';
import { MatchStatus } from '@prisma/client';
import { MatchResponseDto } from '../../matches/dto/match-response.dto';

export class SeasonRoundSimulationResponseDto {
  @ApiProperty({ example: 'season_2026' })
  seasonId!: string;

  @ApiProperty({ example: 12, minimum: 1 })
  round!: number;

  @ApiProperty({ enum: MatchStatus, example: MatchStatus.COMPLETED })
  status!: MatchStatus;

  @ApiProperty({ type: [MatchResponseDto] })
  matches!: MatchResponseDto[];

  @ApiProperty({ example: true })
  standingsUpdated!: boolean;
}
