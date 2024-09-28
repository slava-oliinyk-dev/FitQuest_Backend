import { ExerciseModel } from '@prisma/client';
import { ExerciseDto } from './dto/exercise.dto';
import { ExerciseEntity } from './entity/exercise.entity';

export interface IExerciseRepository {
  getExercisesRepository(dayId: number, userId: number): Promise<ExerciseModel[]>;
  createExerciseRepository(dto: ExerciseDto, dayId: number): Promise<ExerciseModel>;
  findExerciseById(exerciseId: number, dayId: number): Promise<ExerciseModel | null>;
  updateExerciseRepository(entity: ExerciseEntity): Promise<ExerciseModel>;
  getExerciseRepository(dayId: number, exerciseId: number, userId: number): Promise<ExerciseModel | null>;
  deleteExerciseById(exerciseId: number): Promise<void>;
}
