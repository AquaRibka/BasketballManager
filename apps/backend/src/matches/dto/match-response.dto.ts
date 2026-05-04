import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '@prisma/client';

export class MatchTeamDto {
  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  id!: string;

  @ApiProperty({ example: 'CSKA Moscow' })
  name!: string;

  @ApiProperty({ example: 'CSKA' })
  shortName!: string;

  @ApiPropertyOptional({ example: 88, minimum: 0, maximum: 100 })
  rating?: number;
}

export class MatchResponseDto {
  @ApiProperty({ example: 'cmatch000000000000000001' })
  id!: string;

  @ApiPropertyOptional({ example: 'season_2026', nullable: true })
  seasonId!: string | null;

  @ApiPropertyOptional({ example: 12, nullable: true })
  round!: number | null;

  @ApiProperty({ enum: MatchStatus, example: MatchStatus.COMPLETED })
  status!: MatchStatus;

  @ApiProperty({ type: MatchTeamDto })
  homeTeam!: MatchTeamDto;

  @ApiProperty({ type: MatchTeamDto })
  awayTeam!: MatchTeamDto;

  @ApiPropertyOptional({ example: '2026-10-01T18:00:00.000Z', nullable: true })
  date!: string | null;

  @ApiPropertyOptional({ example: 84, nullable: true })
  homeScore!: number | null;

  @ApiPropertyOptional({ example: 79, nullable: true })
  awayScore!: number | null;

  @ApiPropertyOptional({ example: 'cmon3wd920000k7sbuepwfi6r', nullable: true })
  winnerTeamId!: string | null;

  @ApiPropertyOptional({ example: '2026-05-01T18:00:00.000Z', nullable: true })
  playedAt!: string | null;
}

export class MatchListResponseDto {
  @ApiProperty({ type: [MatchResponseDto] })
  items!: MatchResponseDto[];

  @ApiProperty({ example: 5 })
  total!: number;
}

export class MatchSimulationResponseDto extends MatchResponseDto {
  @ApiProperty({ example: 91 })
  override homeScore!: number;

  @ApiProperty({ example: 84 })
  override awayScore!: number;

  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  override winnerTeamId!: string;

  @ApiProperty({
    example: true,
    description: 'True when standings should be recalculated after this match result.',
  })
  standingsUpdateRequired!: boolean;
}
