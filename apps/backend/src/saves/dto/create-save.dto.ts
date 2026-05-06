import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsCuidString } from '../../common/decorators/is-cuid-string.decorator';
import { TrimString } from '../../common/decorators/trim-string.decorator';

export class CreateSaveDto {
  @ApiProperty({ example: 'My Career', maxLength: 120 })
  @TrimString()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  @TrimString()
  @IsCuidString({ message: 'teamId must be a valid cuid' })
  teamId!: string;
}
