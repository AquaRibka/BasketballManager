import { IntersectionType } from '@nestjs/swagger';
import { PlayerBaseFieldsDto } from './player-base-fields.dto';
import { PlayerCoreAttributesDto } from './player-core-attributes.dto';
import { PlayerSummaryRatingsDto } from './player-summary-ratings.dto';

class CreatePlayerRequiredFieldsDto extends IntersectionType(
  PlayerBaseFieldsDto,
  PlayerCoreAttributesDto,
) {}

export class CreatePlayerDto extends IntersectionType(
  CreatePlayerRequiredFieldsDto,
  PlayerSummaryRatingsDto,
) {}
