import { IsString, IsOptional, IsEmail } from 'class-validator';

export class TestLoginDto {
  @IsString()
  provider!: string;

  @IsString()
  providerUserId!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}
