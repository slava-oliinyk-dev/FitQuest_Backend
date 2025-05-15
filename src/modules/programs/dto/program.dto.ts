import { IsDateString, IsInt, IsString } from 'class-validator';

export class ProgramDto {
	@IsString({ message: 'Program title is required' })
	title: string;
}
