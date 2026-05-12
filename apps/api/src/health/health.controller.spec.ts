import { Test } from '@nestjs/testing';
import type { HealthResponse } from '@habit-tracker/shared';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns the API health status with an ISO timestamp', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    const controller = moduleRef.get(HealthController);

    const response: HealthResponse = controller.getHealth();

    expect(response.status).toBe('ok');
    expect(response.service).toBe('habit-tracker-api');
    expect(new Date(response.timestamp).toISOString()).toBe(response.timestamp);
  });
});
