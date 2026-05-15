import { Module } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';

@Module({
  controllers: [HabitsController],
  providers: [HabitsService, AuthenticatedGuard],
})
export class HabitsModule {}
