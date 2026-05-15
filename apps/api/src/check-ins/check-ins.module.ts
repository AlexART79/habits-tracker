import { Module } from '@nestjs/common';
import { CheckInsController } from './check-ins.controller';
import { CheckInsService } from './check-ins.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';

@Module({
  controllers: [CheckInsController],
  providers: [CheckInsService, AuthenticatedGuard],
})
export class CheckInsModule {}
