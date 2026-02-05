import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsInt,
  IsNumberString,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsNumberString()
  nationalID?: string;
}
