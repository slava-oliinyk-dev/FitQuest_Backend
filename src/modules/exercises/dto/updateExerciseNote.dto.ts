import { IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateExerciseNoteDto {
  @IsOptional()
  @IsInt({ message: 'Exercise id must be an integer' })
  id?: number;

  @IsOptional()
  @IsString({ message: 'Note must be a string' })
  note?: string | null;

  @IsOptional()
  @IsInt({ message: 'Workout day id must be an integer' })
  workoutDayId?: number;
}
