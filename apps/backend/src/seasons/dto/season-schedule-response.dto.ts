import { ApiProperty } from '@nestjs/swagger';
import { MatchStatus } from '@prisma/client';
import { MatchResponseDto } from '../../matches/dto/match-response.dto';

export class SeasonScheduleRoundDto {
  @ApiProperty({ example: 1, minimum: 1 })
  round!: number;

  @ApiProperty({ enum: MatchStatus, example: MatchStatus.SCHEDULED })
  status!: MatchStatus;

  @ApiProperty({ type: [MatchResponseDto] })
  matches!: MatchResponseDto[];
}

export class SeasonScheduleResponseDto {
  @ApiProperty({ example: 'season_2026' })
  seasonId!: string;

  @ApiProperty({ type: [SeasonScheduleRoundDto] })
  rounds!: SeasonScheduleRoundDto[];

  @ApiProperty({ example: 44 })
  totalRounds!: number;

  @ApiProperty({ example: 220 })
  totalMatches!: number;
}
