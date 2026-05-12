import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@habit-tracker/shared';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'habit-tracker-api',
      timestamp: new Date().toISOString(),
    };
  }
}
