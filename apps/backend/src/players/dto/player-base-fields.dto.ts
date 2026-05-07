import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerPosition } from '@prisma/client';
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
  @ApiPropertyOptional({ example: 'cmon3wd920000k7sbuepwfi6r' })
  @TrimString()
  @IsCuidString({ message: 'teamId must be a valid cuid' })
  @IsString()
  @IsNotEmpty()
  teamId?: string;
}
