import { IsDateString, IsInt, IsString } from 'class-validator';

export class ProgramWithDaysDto {
	@IsString({ message: 'Program title is required' })
	title: string;

	@IsDateString()
	creationDate: string;

	@IsInt()
	workoutDaysCount: number;

	userName: string;
}
