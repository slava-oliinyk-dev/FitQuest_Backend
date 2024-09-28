import { IsString, IsInt, IsOptional, IsNumber } from 'class-validator';

export class ExerciseDto {
  @IsOptional()
  id?: number; 

  @IsString({ message: 'Exercise name is required' })
  name: string;

  @IsInt({ message: 'Sets must be an integer' })
  sets: number;

  @IsInt({ message: 'Repetitions must be an integer' })
  repetitions: number;

  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a number' })
  weight?: number | null;

  @IsOptional()
  @IsInt({ message: 'Rest time must be an integer' })
  restTime?: number | null;

  @IsOptional()
  @IsString({ message: 'Note must be a string' })
  note?: string | null;

  @IsOptional()
  @IsString({ message: 'Progress mark must be a string' })
  progressMark?: string | null;
}
