import { ExerciseDto } from './dto/exercise.dto';

export interface IExerciseService {
  getExercisesService(dayId: number, userId: number): Promise<ExerciseDto[]>;
  createExerciseService(dto: ExerciseDto, dayId: number, userId: number): Promise<ExerciseDto>;
  updateExerciseService(dto: ExerciseDto, dayId: number, exerciseId: number, userId: number): Promise<ExerciseDto>;
  getExerciseService(dayId: number, exerciseId: number, userId: number): Promise<ExerciseDto>;
  deleteExerciseService(dayId: number, exerciseId: number, userId: number): Promise<boolean>;
}
