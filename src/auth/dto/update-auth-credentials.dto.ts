import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MaxLength,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateAuthCredentialsDto {
  @IsNotEmpty()
  @IsString()
  fullname: string;
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
}
