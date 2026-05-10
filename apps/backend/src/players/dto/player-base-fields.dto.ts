import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PLAYER_BODY_TYPES,
  PLAYER_DOMINANT_HANDS,
  PLAYER_POSITIONS,
  PLAYER_RANGE_PRESETS,
  type PlayerBodyType,
  type PlayerDominantHand,
} from '@basketball-manager/shared';
import { PlayerPosition } from '@prisma/client';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsCuidString } from '../../common/decorators/is-cuid-string.decorator';
import { TrimString } from '../../common/decorators/trim-string.decorator';
import { PLAYER_MAX_AGE, PLAYER_MIN_AGE, PLAYER_NAME_MAX_LENGTH } from './player-dto.constants';

export class PlayerBaseFieldsDto {
  @ApiProperty({ example: 'Ilya Melnikov', maxLength: PLAYER_NAME_MAX_LENGTH })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(PLAYER_NAME_MAX_LENGTH)
  name!: string;

  @ApiProperty({ example: 24, minimum: PLAYER_MIN_AGE, maximum: PLAYER_MAX_AGE })
  @IsInt()
  @Min(PLAYER_MIN_AGE)
  @Max(PLAYER_MAX_AGE)
  age!: number;

  @ApiProperty({ enum: PlayerPosition, example: PlayerPosition.SF })
  @IsEnum(PlayerPosition)
  position!: PlayerPosition;

  @IsOptional()
  @ApiPropertyOptional({ example: '2002-07-16T00:00:00.000Z' })
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @ApiPropertyOptional({ enum: PLAYER_DOMINANT_HANDS, example: 'RIGHT' })
  @IsIn(PLAYER_DOMINANT_HANDS)
  dominantHand?: PlayerDominantHand;

  @IsOptional()
  @ApiPropertyOptional({ enum: PLAYER_POSITIONS, isArray: true, example: ['SG', 'SF'] })
  @IsArray()
  @ArrayMaxSize(2)
  @ArrayUnique()
  @IsIn(PLAYER_POSITIONS, { each: true })
  secondaryPositions?: PlayerPosition[];

  @IsOptional()
  @ApiPropertyOptional({
    example: 198,
    minimum: PLAYER_RANGE_PRESETS.heightCm.min,
    maximum: PLAYER_RANGE_PRESETS.heightCm.max,
  })
  @IsInt()
  @Min(PLAYER_RANGE_PRESETS.heightCm.min)
  @Max(PLAYER_RANGE_PRESETS.heightCm.max)
  heightCm?: number;

  @IsOptional()
  @ApiPropertyOptional({
    example: 96,
    minimum: PLAYER_RANGE_PRESETS.weightKg.min,
    maximum: PLAYER_RANGE_PRESETS.weightKg.max,
  })
  @IsInt()
  @Min(PLAYER_RANGE_PRESETS.weightKg.min)
  @Max(PLAYER_RANGE_PRESETS.weightKg.max)
  weightKg?: number;

  @IsOptional()
  @ApiPropertyOptional({
    example: 210,
    minimum: PLAYER_RANGE_PRESETS.wingspanCm.min,
    maximum: PLAYER_RANGE_PRESETS.wingspanCm.max,
  })
  @IsInt()
  @Min(PLAYER_RANGE_PRESETS.wingspanCm.min)
  @Max(PLAYER_RANGE_PRESETS.wingspanCm.max)
  wingspanCm?: number;

  @IsOptional()
  @ApiPropertyOptional({ enum: PLAYER_BODY_TYPES, example: 'ATHLETIC' })
  @IsIn(PLAYER_BODY_TYPES)
  bodyType?: PlayerBodyType;

  @IsOptional()
  @ApiPropertyOptional({ example: 'cmon3wd920000k7sbuepwfi6r' })
  @TrimString()
  @IsCuidString({ message: 'teamId must be a valid cuid' })
  @IsString()
  @IsNotEmpty()
  teamId?: string;
}
