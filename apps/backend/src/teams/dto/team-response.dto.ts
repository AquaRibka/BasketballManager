import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  TeamDetailsShape,
  TeamPlayerShape,
  TeamRosterResponseShape,
  TeamSummaryShape,
} from '@basketball-manager/shared';
import { PlayerPosition } from '@prisma/client';

export class TeamPlayerDto implements TeamPlayerShape {
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
  teamId!: string | null;

  @ApiProperty({ example: '2026-05-01T16:09:33.730Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-01T16:09:33.730Z' })
  updatedAt!: string;
}

export class TeamResponseDto implements TeamSummaryShape {
  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  id!: string;

  @ApiProperty({ example: 'CSKA Moscow' })
  name!: string;

  @ApiProperty({ example: 'Moscow' })
  city!: string;

  @ApiProperty({ example: 'CSKA' })
  shortName!: string;

  @ApiProperty({ example: 88, minimum: 0, maximum: 100 })
  rating!: number;

  @ApiProperty({ example: '2026-05-01T16:07:37.238Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-01T16:09:33.659Z' })
  updatedAt!: string;
}

export class TeamDetailsResponseDto extends TeamResponseDto implements TeamDetailsShape {
  @ApiProperty({ type: [TeamPlayerDto] })
  players!: TeamPlayerDto[];
}

export class TeamListResponseDto {
  @ApiProperty({ type: [TeamResponseDto] })
  items!: TeamResponseDto[];

  @ApiProperty({ example: 11 })
  total!: number;
}

export class TeamRosterResponseDto implements TeamRosterResponseShape {
  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  teamId!: string;

  @ApiProperty({ type: [TeamPlayerDto] })
  items!: TeamPlayerDto[];

  @ApiProperty({ example: 8 })
  total!: number;
}
