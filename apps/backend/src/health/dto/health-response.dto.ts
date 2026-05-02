import { ApiProperty } from '@nestjs/swagger';

class HealthDatabaseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: 'basketball_manager' })
  name!: string;
}

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: 'backend' })
  service!: string;

  @ApiProperty({ type: HealthDatabaseDto })
  database!: HealthDatabaseDto;
}
