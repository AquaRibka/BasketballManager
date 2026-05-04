import { ApiProperty } from '@nestjs/swagger';
import { SeasonStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateSeasonStatusDto {
  @ApiProperty({ enum: SeasonStatus, example: SeasonStatus.COMPLETED })
  @IsEnum(SeasonStatus)
  status!: SeasonStatus;
}
