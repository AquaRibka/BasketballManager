import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { PLAYER_MAX_RATING, PLAYER_MIN_RATING } from './player-dto.constants';

export class PlayerCoreAttributesDto {
  @ApiProperty({ example: 93, minimum: PLAYER_MIN_RATING, maximum: PLAYER_MAX_RATING })
  @IsInt()
  @Min(PLAYER_MIN_RATING)
  @Max(PLAYER_MAX_RATING)
  shooting!: number;

  @ApiProperty({ example: 90, minimum: PLAYER_MIN_RATING, maximum: PLAYER_MAX_RATING })
  @IsInt()
  @Min(PLAYER_MIN_RATING)
  @Max(PLAYER_MAX_RATING)
  passing!: number;

  @ApiProperty({ example: 92, minimum: PLAYER_MIN_RATING, maximum: PLAYER_MAX_RATING })
  @IsInt()
  @Min(PLAYER_MIN_RATING)
  @Max(PLAYER_MAX_RATING)
  defense!: number;

  @ApiProperty({ example: 91, minimum: PLAYER_MIN_RATING, maximum: PLAYER_MAX_RATING })
  @IsInt()
  @Min(PLAYER_MIN_RATING)
  @Max(PLAYER_MAX_RATING)
  rebounding!: number;

  @ApiProperty({ example: 94, minimum: PLAYER_MIN_RATING, maximum: PLAYER_MAX_RATING })
  @IsInt()
  @Min(PLAYER_MIN_RATING)
  @Max(PLAYER_MAX_RATING)
  athleticism!: number;
}
