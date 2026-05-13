import { HABIT_STATUSES } from '@habit-tracker/shared';
import { IsIn, IsOptional } from 'class-validator';

export class ListHabitsQueryDto {
  @IsOptional()
  @IsIn(HABIT_STATUSES)
  status?: (typeof HABIT_STATUSES)[number];
}
