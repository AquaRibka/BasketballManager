import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { TrimString } from '../../common/decorators/trim-string.decorator';

export class UpdateTeamDto {
  @IsOptional()
  @ApiPropertyOptional({ example: 'CSKA Moscow', maxLength: 120 })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'Moscow', maxLength: 120 })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'CSKA', maxLength: 10 })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  shortName?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 88, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  rating?: number;
}
