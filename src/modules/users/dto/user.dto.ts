import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserDto {
	@IsOptional()
	@IsEmail({}, { message: 'Invalid email' })
	email?: string;

	@IsOptional()
	@IsString({ message: 'Invalid password' })
	password?: string;

	@IsOptional()
	@IsString({ message: 'Invalid name' })
	name?: string;

	@IsOptional()
	@IsString({ message: 'Invalid unique login' })
	uniqueLogin?: string;

	@IsOptional()
	@IsString({ message: 'Invalid role' })
	role?: string;

	@IsOptional()
	@IsString({ message: 'Invalid photo URL' })
	photo?: string;

	@IsOptional()
	@IsString({ message: 'Invalid bio' })
	bio?: string;

	provider!: 'LOCAL' | 'GOOGLE';
}
