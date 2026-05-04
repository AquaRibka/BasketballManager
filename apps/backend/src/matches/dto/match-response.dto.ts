import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class MatchTeamDto {
  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  id!: string;

  @ApiProperty({ example: 'CSKA Moscow' })
  name!: string;

  @ApiProperty({ example: 'CSKA' })
  shortName!: string;

  @ApiProperty({ example: 88, minimum: 0, maximum: 100 })
  rating!: number;
}

export class MatchSimulationResponseDto {
  @ApiProperty({ example: 'cmatch000000000000000001' })
  id!: string;

  @ApiPropertyOptional({ example: 'season_2026', nullable: true })
  seasonId!: string | null;

  @ApiPropertyOptional({ example: 12, nullable: true })
  round!: number | null;

  @ApiProperty({ example: 'COMPLETED' })
  status!: string;

  @ApiProperty({ type: MatchTeamDto })
  homeTeam!: MatchTeamDto;

  @ApiProperty({ type: MatchTeamDto })
  awayTeam!: MatchTeamDto;

  @ApiProperty({ example: 91 })
  homeScore!: number;

  @ApiProperty({ example: 84 })
  awayScore!: number;

  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  winnerTeamId!: string;

  @ApiProperty({
    example: true,
    description: 'True when standings should be recalculated after this match result.',
  })
  standingsUpdateRequired!: boolean;

  @ApiPropertyOptional({ example: '2026-05-02T14:00:00.000Z', nullable: true })
  playedAt!: string | null;
}
