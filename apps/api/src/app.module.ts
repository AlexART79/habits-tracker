import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CheckInsModule } from './check-ins/check-ins.module';
import { HabitsModule } from './habits/habits.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { StreaksModule } from './streaks/streaks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    HabitsModule,
    CheckInsModule,
    StreaksModule,
    NotificationsModule,
  ],
})
export class AppModule {}
