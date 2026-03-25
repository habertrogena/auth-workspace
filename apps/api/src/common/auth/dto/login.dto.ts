import { IsEmail, IsString, MinLength, ValidateIf } from 'class-validator';

/**
 * Login: use email (business users) or username (admin). At least one required.
 */
export class LoginDto {
  @ValidateIf((o) => !o.username)
  @IsEmail()
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  username?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
