import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { PLAYER_MAX_RATING, PLAYER_MIN_RATING } from './player-dto.constants';

export class PlayerSummaryRatingsDto {
  @ApiProperty({ example: 94, minimum: PLAYER_MIN_RATING, maximum: PLAYER_MAX_RATING })
  @IsInt()
  @Min(PLAYER_MIN_RATING)
  @Max(PLAYER_MAX_RATING)
  potential!: number;

  @IsOptional()
  @ApiPropertyOptional({
    example: 89,
    minimum: PLAYER_MIN_RATING,
    maximum: PLAYER_MAX_RATING,
    deprecated: true,
    description: 'Deprecated input. Overall is derived from the current player attributes.',
  })
  @IsInt()
  @Min(PLAYER_MIN_RATING)
  @Max(PLAYER_MAX_RATING)
  overall?: number;
}
