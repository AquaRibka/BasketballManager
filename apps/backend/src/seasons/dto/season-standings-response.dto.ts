import { ApiProperty } from '@nestjs/swagger';

export class SeasonStandingRowDto {
  @ApiProperty({ example: 1, minimum: 1 })
  position!: number;

  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  teamId!: string;

  @ApiProperty({ example: 'CSKA Moscow' })
  teamName!: string;

  @ApiProperty({ example: 'CSKA' })
  shortName!: string;

  @ApiProperty({ example: 12, minimum: 0 })
  gamesPlayed!: number;

  @ApiProperty({ example: 10, minimum: 0 })
  wins!: number;

  @ApiProperty({ example: 2, minimum: 0 })
  losses!: number;

  @ApiProperty({ example: 84 })
  pointsFor!: number;

  @ApiProperty({ example: 79 })
  pointsAgainst!: number;

  @ApiProperty({ example: 5 })
  pointDiff!: number;

  @ApiProperty({ example: 0.833 })
  winPercentage!: number;
}

export class SeasonStandingsResponseDto {
  @ApiProperty({ example: 'season_2026' })
  seasonId!: string;

  @ApiProperty({ example: '2026-05-01T18:05:00.000Z', nullable: true })
  updatedAt!: string | null;

  @ApiProperty({ type: [SeasonStandingRowDto] })
  items!: SeasonStandingRowDto[];
}
