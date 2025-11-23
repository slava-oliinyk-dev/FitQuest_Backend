import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ConsultationDto {
	@IsEmail()
	@MaxLength(255)
	email: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	name: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(5)
	@MaxLength(2000)
	message: string;
}
