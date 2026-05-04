import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { IsCuidString } from '../../common/decorators/is-cuid-string.decorator';
import { TrimString } from '../../common/decorators/trim-string.decorator';

export class ListMatchesQueryDto {
  @ApiProperty({ example: 'season_2026' })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  seasonId!: string;

  @ApiPropertyOptional({ example: 12, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  round?: number;

  @ApiPropertyOptional({ example: 'cmon3wd920000k7sbuepwfi6r' })
  @IsOptional()
  @TrimString()
  @IsCuidString({ message: 'teamId must be a valid cuid' })
  teamId?: string;

  @ApiPropertyOptional({ enum: MatchStatus, example: MatchStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;
}
