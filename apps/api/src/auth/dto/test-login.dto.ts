import { AUTH_PROVIDERS, type AuthProvider } from '@habit-tracker/shared';
import { IsEmail, IsIn, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class TestLoginDto {
  @IsIn(AUTH_PROVIDERS)
  provider!: AuthProvider;

  @IsString()
  @MaxLength(128)
  providerUserId!: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsString()
  @MaxLength(120)
  displayName!: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string | null;
}
