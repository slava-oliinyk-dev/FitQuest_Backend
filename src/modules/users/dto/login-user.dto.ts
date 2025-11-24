import { IsEmail, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Email must be valid' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @Length(6, 64, { message: 'Password must be between 6 and 64 characters' })
  password!: string;
}
