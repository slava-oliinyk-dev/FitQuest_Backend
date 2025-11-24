import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class EmailRequestDto {
  @IsEmail({}, { message: 'Email must be valid' })
  email!: string;

  @IsString({ message: 'Subject must be a string' })
  @Length(3, 120, { message: 'Subject must be between 3 and 120 characters' })
  subject!: string;

  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  message!: string;
}
