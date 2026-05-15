import { IsString, IsOptional, MaxLength, MinLength, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateHabitDto {
  @Transform(({ value }: { value: string }) => value.trim())
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsDateString()
  startDate!: string;
}
