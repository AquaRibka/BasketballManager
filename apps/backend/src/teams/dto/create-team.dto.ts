import { TrimString } from '../../common/decorators/trim-string.decorator';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateTeamDto {
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city!: string;

  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  shortName!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  rating!: number;
}
