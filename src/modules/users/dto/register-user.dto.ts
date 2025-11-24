import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: 'Email must be valid' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @Length(6, 64, { message: 'Password must be between 6 and 64 characters' })
  password!: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsString({ message: 'Unique login must be a string' })
  @Length(3, 50, { message: 'Unique login must be between 3 and 50 characters' })
  uniqueLogin!: string;

  @IsOptional()
  @IsIn(['ADMIN', 'USER'], { message: 'Role must be ADMIN or USER' })
  role?: 'ADMIN' | 'USER';

  @IsOptional()
  @IsString({ message: 'Photo must be a string' })
  photo?: string | null;

  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  bio?: string | null;
}
