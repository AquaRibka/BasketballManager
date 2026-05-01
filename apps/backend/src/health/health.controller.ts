import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(@Res() response: Response) {
    const result = await this.healthService.check();

    response.status(result.httpStatus).json(result.body);
  }
}
