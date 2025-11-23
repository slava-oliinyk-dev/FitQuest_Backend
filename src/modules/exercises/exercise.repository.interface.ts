import { ExerciseModel } from '@prisma/client';
import { ExerciseDto } from './dto/exercise.dto';
import { ExerciseEntity } from './entity/exercise.entity';
import { UpdateExerciseNoteDto } from './dto/updateExerciseNote.dto';

export interface IExerciseRepository {
  getExercisesByDayAndUser(dayId: number, userId: number): Promise<ExerciseModel[]>;
  createExercise(dayId: number, dto: ExerciseDto): Promise<ExerciseModel>;
  findExerciseByIdAndDay(exerciseId: number, dayId: number): Promise<ExerciseModel | null>;
  updateExercise(entity: ExerciseEntity): Promise<ExerciseModel>;
  updateExerciseNote(dto: UpdateExerciseNoteDto): Promise<ExerciseModel>;
  getExerciseByIdAndUser(
    dayId: number,
    exerciseId: number,
    userId: number,
  ): Promise<ExerciseModel | null>;
  deleteExercise(exerciseId: number): Promise<void>;
}
