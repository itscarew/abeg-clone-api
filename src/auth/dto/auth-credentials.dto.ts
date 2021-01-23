import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';

export class AuthCredentialsDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsPhoneNumber(null)
  phoneNumber: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password is too short (6 characters min)' })
  @MaxLength(20, { message: 'Password is too long (20 characters max)' })
  password: string;
}
