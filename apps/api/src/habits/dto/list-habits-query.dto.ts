import { HABIT_STATUSES } from '@habit-tracker/shared';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListHabitsQueryDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();

    return trimmedValue === '' ? undefined : trimmedValue;
  })
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsIn(HABIT_STATUSES)
  status?: (typeof HABIT_STATUSES)[number];

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return value;
  })
  @IsBoolean()
  completedToday?: boolean;
}
