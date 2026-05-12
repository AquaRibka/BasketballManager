import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export const PLAYER_RESPONSE_VIEWS = ['compact', 'full'] as const;

export type PlayerResponseView = (typeof PLAYER_RESPONSE_VIEWS)[number];

export class PlayerResponseQueryDto {
  @ApiPropertyOptional({
    enum: PLAYER_RESPONSE_VIEWS,
    default: 'compact',
    description:
      'compact returns roster/list fields; full includes public profiles, history, stats and awards',
  })
  @IsOptional()
  @IsIn(PLAYER_RESPONSE_VIEWS)
  view?: PlayerResponseView;
}
