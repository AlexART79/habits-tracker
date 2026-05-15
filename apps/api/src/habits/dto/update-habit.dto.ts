import { IsString, IsOptional, MaxLength, IsDateString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum HabitStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED',
}

export class UpdateHabitDto {
  @IsOptional()
  @Transform(({ value }: { value: string }) => value.trim())
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsEnum(HabitStatus)
  status?: HabitStatus;
}
