import { IsEmail } from 'class-validator';

export class ReEmailDto {
  @IsEmail({}, { message: 'Email must be valid' })
  email!: string;
}
