import { IsNotEmpty, IsString } from 'class-validator';
import { TrimString } from '../../common/decorators/trim-string.decorator';

export class SeasonParamDto {
  @TrimString()
  @IsString()
  @IsNotEmpty()
  id!: string;
}
