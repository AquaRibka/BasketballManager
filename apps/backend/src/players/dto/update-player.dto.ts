import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PlayerPosition } from '@prisma/client';
import { IsCuidString } from '../../common/decorators/is-cuid-string.decorator';
import { TrimString } from '../../common/decorators/trim-string.decorator';

export class UpdatePlayerDto {
  @IsOptional()
  @ApiPropertyOptional({ example: 'Ilya Melnikov', maxLength: 120 })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 24, minimum: 16, maximum: 50 })
  @IsInt()
  @Min(16)
  @Max(50)
  age?: number;

  @IsOptional()
  @ApiPropertyOptional({ enum: PlayerPosition, example: PlayerPosition.SF })
  @IsEnum(PlayerPosition)
  position?: PlayerPosition;

  @IsOptional()
  @ApiPropertyOptional({ example: 93, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  shooting?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 90, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  passing?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 92, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  defense?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 91, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  rebounding?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 94, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  athleticism?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 94, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  potential?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 89, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  overall?: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 'cmon3wd920000k7sbuepwfi6r' })
  @TrimString()
  @IsCuidString({ message: 'teamId must be a valid cuid' })
  @IsString()
  @IsNotEmpty()
  teamId?: string | null;
}
