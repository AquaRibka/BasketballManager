import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { TrimString } from '../../common/decorators/trim-string.decorator';

export class UpdateTeamDto {
  @IsOptional()
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  shortName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rating?: number;
}
