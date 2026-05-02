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

export class CreatePlayerDto {
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsInt()
  @Min(16)
  @Max(50)
  age!: number;

  @IsEnum(PlayerPosition)
  position!: PlayerPosition;

  @IsInt()
  @Min(0)
  @Max(100)
  shooting!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  passing!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  defense!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  rebounding!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  athleticism!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  potential!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  overall!: number;

  @IsOptional()
  @TrimString()
  @IsCuidString({ message: 'teamId must be a valid cuid' })
  @IsString()
  @IsNotEmpty()
  teamId?: string;
}
