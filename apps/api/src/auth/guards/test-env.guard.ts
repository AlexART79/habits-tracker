import { Injectable, CanActivate, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TestEnvGuard implements CanActivate {
  canActivate(): boolean {
    const env = process.env['NODE_ENV'];
    if (env === 'test' || env === 'development') {
      return true;
    }
    throw new ForbiddenException('Test login endpoint is not available in this environment');
  }
}
