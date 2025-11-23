import { ExerciseDto } from './dto/exercise.dto';
import { UpdateExerciseNoteDto } from './dto/updateExerciseNote.dto';

export interface IExerciseService {
  getExercisesService(dayId: number, userId: number): Promise<ExerciseDto[]>;
  createExerciseService(dto: ExerciseDto, dayId: number, userId: number): Promise<ExerciseDto>;
  updateExerciseService(
    dto: ExerciseDto,
    dayId: number,
    exerciseId: number,
    userId: number,
  ): Promise<ExerciseDto>;
  updateExerciseNoteService(
    dto: UpdateExerciseNoteDto,
    dayId: number,
    exerciseId: number,
    userId: number,
  ): Promise<UpdateExerciseNoteDto>;
  getExerciseService(dayId: number, exerciseId: number, userId: number): Promise<ExerciseDto>;
  deleteExerciseService(dayId: number, exerciseId: number, userId: number): Promise<boolean>;
}
