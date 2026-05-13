import type { INestApplication } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureApp } from './app.setup';

function createAppStub(): INestApplication {
  return {
    setGlobalPrefix: vi.fn(),
    enableCors: vi.fn(),
    use: vi.fn(),
    useGlobalPipes: vi.fn(),
  } as unknown as INestApplication;
}

describe('configureApp', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSessionSecret = process.env.SESSION_SECRET;

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalSessionSecret === undefined) {
      delete process.env.SESSION_SECRET;
    } else {
      process.env.SESSION_SECRET = originalSessionSecret;
    }
  });

  it('requires SESSION_SECRET in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.SESSION_SECRET;

    expect(() => configureApp(createAppStub())).toThrow(
      'SESSION_SECRET is required in production.',
    );
  });
});
