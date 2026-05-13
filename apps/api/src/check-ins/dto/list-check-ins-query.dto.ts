import { IsString, Matches } from 'class-validator';

export class ListCheckInsQueryDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  month!: string;
}
