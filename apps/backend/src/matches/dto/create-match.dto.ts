import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { IsCuidString } from '../../common/decorators/is-cuid-string.decorator';
import { TrimString } from '../../common/decorators/trim-string.decorator';

export class CreateMatchDto {
  @ApiProperty({ example: 'season_2026' })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  seasonId!: string;

  @ApiProperty({ example: 12, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  round!: number;

  @ApiPropertyOptional({ example: '2026-10-01T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  @TrimString()
  @IsCuidString({ message: 'homeTeamId must be a valid cuid' })
  homeTeamId!: string;

  @ApiProperty({ example: 'cmon47b2400008csbqzi34a1a' })
  @TrimString()
  @IsCuidString({ message: 'awayTeamId must be a valid cuid' })
  awayTeamId!: string;
}
