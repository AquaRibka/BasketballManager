import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerPosition } from '@prisma/client';

export class PlayerTeamSummaryDto {
  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  id!: string;

  @ApiProperty({ example: 'CSKA Moscow' })
  name!: string;

  @ApiProperty({ example: 'CSKA' })
  shortName!: string;
}

export class PlayerResponseDto {
  @ApiProperty({ example: 'cmon3yv4y0003qfsbfdn5nihz' })
  id!: string;

  @ApiProperty({ example: 'Ilya Melnikov' })
  name!: string;

  @ApiProperty({ example: 24, minimum: 16, maximum: 50 })
  age!: number;

  @ApiProperty({ enum: PlayerPosition, example: PlayerPosition.SF })
  position!: PlayerPosition;

  @ApiProperty({ example: 93, minimum: 0, maximum: 100 })
  shooting!: number;

  @ApiProperty({ example: 90, minimum: 0, maximum: 100 })
  passing!: number;

  @ApiProperty({ example: 92, minimum: 0, maximum: 100 })
  defense!: number;

  @ApiProperty({ example: 91, minimum: 0, maximum: 100 })
  rebounding!: number;

  @ApiProperty({ example: 94, minimum: 0, maximum: 100 })
  athleticism!: number;

  @ApiProperty({ example: 94, minimum: 0, maximum: 100 })
  potential!: number;

  @ApiProperty({ example: 89, minimum: 0, maximum: 100 })
  overall!: number;

  @ApiPropertyOptional({ example: 'cmon3wd920000k7sbuepwfi6r', nullable: true })
  teamId?: string | null;

  @ApiProperty({ example: '2026-05-01T16:09:33.730Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-01T16:09:33.730Z' })
  updatedAt!: string;

  @ApiPropertyOptional({ type: PlayerTeamSummaryDto, nullable: true })
  team?: PlayerTeamSummaryDto | null;
}

export class PlayerListResponseDto {
  @ApiProperty({ type: [PlayerResponseDto] })
  items!: PlayerResponseDto[];

  @ApiProperty({ example: 88 })
  total!: number;
}
