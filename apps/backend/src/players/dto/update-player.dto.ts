import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PlayerPosition } from '@prisma/client';
import { IsCuidString } from '../../common/decorators/is-cuid-string.decorator';
import { TrimString } from '../../common/decorators/trim-string.decorator';

export class UpdatePlayerDto {
  @IsOptional()
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(16)
  @Max(50)
  age?: number;

  @IsOptional()
  @IsEnum(PlayerPosition)
  position?: PlayerPosition;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  shooting?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passing?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  defense?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rebounding?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  athleticism?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  potential?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  overall?: number;

  @IsOptional()
  @TrimString()
  @IsCuidString({ message: 'teamId must be a valid cuid' })
  @IsString()
  @IsNotEmpty()
  teamId?: string | null;
}
