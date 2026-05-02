import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreatePlayerDto {
  @ApiProperty({ example: 'Ilya Melnikov', maxLength: 120 })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 24, minimum: 16, maximum: 50 })
  @IsInt()
  @Min(16)
  @Max(50)
  age!: number;

  @ApiProperty({ enum: PlayerPosition, example: PlayerPosition.SF })
  @IsEnum(PlayerPosition)
  position!: PlayerPosition;

  @ApiProperty({ example: 93, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  shooting!: number;

  @ApiProperty({ example: 90, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  passing!: number;

  @ApiProperty({ example: 92, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  defense!: number;

  @ApiProperty({ example: 91, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  rebounding!: number;

  @ApiProperty({ example: 94, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  athleticism!: number;

  @ApiProperty({ example: 94, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  potential!: number;

  @ApiProperty({ example: 89, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  overall!: number;

  @IsOptional()
  @ApiPropertyOptional({ example: 'cmon3wd920000k7sbuepwfi6r' })
  @TrimString()
  @IsCuidString({ message: 'teamId must be a valid cuid' })
  @IsString()
  @IsNotEmpty()
  teamId?: string;
}
