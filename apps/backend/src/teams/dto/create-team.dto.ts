import { ApiProperty } from '@nestjs/swagger';
import type { CreateTeamPayloadShape } from '@basketball-manager/shared';
import { TrimString } from '../../common/decorators/trim-string.decorator';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateTeamDto implements CreateTeamPayloadShape {
  @ApiProperty({ example: 'CSKA Moscow', maxLength: 120 })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'Moscow', maxLength: 120 })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city!: string;

  @ApiProperty({ example: 'CSKA', maxLength: 10 })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  shortName!: string;

  @ApiProperty({ example: 88, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  rating!: number;
}
