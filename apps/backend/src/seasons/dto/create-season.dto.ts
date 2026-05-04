import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator';
import { TrimString } from '../../common/decorators/trim-string.decorator';

export class CreateSeasonDto {
  @ApiProperty({ example: 'VTB League MVP 2026', maxLength: 120 })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 2026, minimum: 2000, maximum: 9999 })
  @IsInt()
  @Min(2000)
  @Max(9999)
  year!: number;
}
