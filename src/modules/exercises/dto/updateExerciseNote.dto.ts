import { IsString, IsInt, IsOptional, IsNumber } from 'class-validator';

export class UpdateExerciseNote {
	@IsOptional()
	id: number;

	@IsOptional()
	@IsString({ message: 'Note must be a string' })
	note: string | null;

	@IsOptional()
	workoutDayId: number;
}
