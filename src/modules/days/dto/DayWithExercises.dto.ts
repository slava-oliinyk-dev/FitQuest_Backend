import { IsDateString, IsInt, IsString } from 'class-validator';

export class DayWithExercisesDto {
	@IsString({ message: 'Day name is required' })
	dayName: string;

	@IsString({ message: 'Muscle group is required' })
	muscle: string;

	@IsDateString()
	creationDate: string;

	@IsInt()
	workoutExercisesCount: number;
}
