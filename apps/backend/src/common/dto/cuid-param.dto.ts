import { IsCuidString } from '../decorators/is-cuid-string.decorator';
import { TrimString } from '../decorators/trim-string.decorator';

export class CuidParamDto {
  @TrimString()
  @IsCuidString({ message: 'id must be a valid cuid' })
  id!: string;
}
