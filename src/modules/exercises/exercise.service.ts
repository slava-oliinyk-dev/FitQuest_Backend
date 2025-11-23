import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { HTTPError } from '../../errors/http-error.class';
import { ILogger } from '../../log/logger.interface';
import { IExerciseService } from './exercise.service.interface';
import { IExerciseRepository } from './exercise.repository.interface';
import { ExerciseDto } from './dto/exercise.dto';
import { IDayRepository } from '../days/day.repository.interface';
import { ExerciseEntity } from './entity/exercise.entity';
import { UpdateExerciseNoteDto } from './dto/updateExerciseNote.dto';

@injectable()
export class ExerciseService implements IExerciseService {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.ExerciseRepository) private exerciseRepository: IExerciseRepository,
    @inject(TYPES.DayRepository) private dayRepository: IDayRepository,
  ) {}

  async getExercisesService(dayId: number, userId: number): Promise<ExerciseDto[]> {
    try {
      const day = await this.dayRepository.findDayByIdAndUser(dayId, userId);
      if (!day) {
        this.loggerService.warn(`Day with ID ${dayId} not found for user ${userId}.`);
        throw new HTTPError(404, 'Day not found');
      }

      const exercises = await this.exerciseRepository.getExercisesByDayAndUser(dayId, userId);

      if (exercises.length === 0) {
        this.loggerService.warn(`No exercises found for day ${dayId} and user ${userId}.`);
      } else {
        this.loggerService.info(
          `Retrieved ${exercises.length} exercises for day ${dayId} and user ${userId}.`,
        );
      }

      return exercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets,
        repetitions: exercise.repetitions,
        weight: exercise.weight,
        restTime: exercise.restTime,
        note: exercise.note,
        progressMark: exercise.progressMark,
      }));
    } catch (error: any) {
      if (error instanceof HTTPError) {
        throw error;
      }
      this.loggerService.error(`Error in getExercisesService: ${error.message}`);
      throw new HTTPError(500, 'Internal Server Error');
    }
  }

  async createExerciseService(
    dto: ExerciseDto,
    dayId: number,
    userId: number,
  ): Promise<ExerciseDto> {
    try {
      const day = await this.dayRepository.findDayByIdAndUser(dayId, userId);
      if (!day) {
        this.loggerService.warn(`Day with ID ${dayId} not found for user ${userId}.`);
        throw new HTTPError(404, 'Day not found');
      }

      const createdExercise = await this.exerciseRepository.createExercise(dayId, dto);
      this.loggerService.info(
        `Exercise created with ID ${createdExercise.id} in day ${dayId} by user ${userId}.`,
      );

      return {
        id: createdExercise.id,
        name: createdExercise.name,
        sets: createdExercise.sets,
        repetitions: createdExercise.repetitions,
        weight: createdExercise.weight,
        restTime: createdExercise.restTime,
        note: createdExercise.note,
        progressMark: createdExercise.progressMark,
      };
    } catch (error: any) {
      if (error instanceof HTTPError) {
        throw error;
      }
      this.loggerService.error(`Error in createExerciseService: ${error.message}`);
      throw new HTTPError(500, 'Internal Server Error');
    }
  }

  async updateExerciseService(
    dto: ExerciseDto,
    dayId: number,
    exerciseId: number,
    userId: number,
  ): Promise<ExerciseDto> {
    try {
      const day = await this.dayRepository.findDayByIdAndUser(dayId, userId);
      if (!day) {
        this.loggerService.warn(`Day with ID ${dayId} not found for user ${userId}.`);
        throw new HTTPError(404, 'Day not found');
      }

      const exercise = await this.exerciseRepository.findExerciseByIdAndDay(exerciseId, dayId);
      if (!exercise) {
        this.loggerService.warn(`Exercise with ID ${exerciseId} not found in day ${dayId}.`);
        throw new HTTPError(404, 'Exercise not found');
      }

      const exerciseEntity = new ExerciseEntity(
        exercise.id,
        exercise.name,
        exercise.sets,
        exercise.repetitions,
        exercise.weight,
        exercise.restTime,
        exercise.note,
        exercise.progressMark,
        exercise.workoutDayId,
      );
      exerciseEntity.update(dto);

      const updatedExercise = await this.exerciseRepository.updateExercise(exerciseEntity);
      this.loggerService.info(`Exercise with ID ${exerciseId} updated by user ${userId}.`);

      return {
        id: updatedExercise.id,
        name: updatedExercise.name,
        sets: updatedExercise.sets,
        repetitions: updatedExercise.repetitions,
        weight: updatedExercise.weight,
        restTime: updatedExercise.restTime,
        note: updatedExercise.note,
        progressMark: updatedExercise.progressMark,
      };
    } catch (error: any) {
      if (error instanceof HTTPError) {
        throw error;
      }
      this.loggerService.error(`Error in updateExerciseService: ${error.message}`);
      throw new HTTPError(500, 'Internal Server Error');
    }
  }

  async updateExerciseNoteService(
    dto: UpdateExerciseNoteDto,
    dayId: number,
    exerciseId: number,
    userId: number,
  ): Promise<UpdateExerciseNoteDto> {
    try {
      const day = await this.dayRepository.findDayByIdAndUser(dayId, userId);
      if (!day) {
        this.loggerService.warn(`Day with ID ${dayId} not found for user ${userId}.`);
        throw new HTTPError(404, 'Day not found');
      }

      const exercise = await this.exerciseRepository.findExerciseByIdAndDay(exerciseId, dayId);
      if (!exercise) {
        this.loggerService.warn(`Exercise with ID ${exerciseId} not found in day ${dayId}.`);
        throw new HTTPError(404, 'Exercise not found');
      }

      const updateDto: UpdateExerciseNoteDto = {
        id: exerciseId,
        workoutDayId: dayId,
        note: dto.note,
      };

      const updatedExercise = await this.exerciseRepository.updateExerciseNote(updateDto);
      this.loggerService.info(
        `Exercise note updated for exercise ${exerciseId} in day ${dayId} by user ${userId}.`,
      );

      return {
        id: updatedExercise.id,
        workoutDayId: updatedExercise.workoutDayId,
        note: updatedExercise.note,
      };
    } catch (error: any) {
      if (error instanceof HTTPError) {
        throw error;
      }
      this.loggerService.error(`Error in updateExerciseNoteService: ${error.message}`);
      throw new HTTPError(500, 'Internal Server Error');
    }
  }

  async getExerciseService(
    dayId: number,
    exerciseId: number,
    userId: number,
  ): Promise<ExerciseDto> {
    try {
      const day = await this.dayRepository.findDayByIdAndUser(dayId, userId);
      if (!day) {
        this.loggerService.warn(`Day with ID ${dayId} not found for user ${userId}.`);
        throw new HTTPError(404, 'Day not found');
      }

      const exercise = await this.exerciseRepository.getExerciseByIdAndUser(
        dayId,
        exerciseId,
        userId,
      );
      if (!exercise) {
        this.loggerService.warn(
          `Exercise with ID ${exerciseId} not found for user ${userId} in day ${dayId}.`,
        );
        throw new HTTPError(404, 'Exercise not found');
      }

      this.loggerService.info(`User ${userId} retrieved exercise with ID ${exerciseId}.`);

      return {
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets,
        repetitions: exercise.repetitions,
        weight: exercise.weight,
        restTime: exercise.restTime,
        note: exercise.note,
        progressMark: exercise.progressMark,
      };
    } catch (error: any) {
      if (error instanceof HTTPError) {
        throw error;
      }
      this.loggerService.error(`Error in getExerciseService: ${error.message}`);
      throw new HTTPError(500, 'Internal Server Error');
    }
  }

  async deleteExerciseService(dayId: number, exerciseId: number, userId: number): Promise<boolean> {
    try {
      const day = await this.dayRepository.findDayByIdAndUser(dayId, userId);
      if (!day) {
        this.loggerService.warn(`Day with ID ${dayId} not found for user ${userId}.`);
        throw new HTTPError(404, 'Day not found');
      }

      const exercise = await this.exerciseRepository.findExerciseByIdAndDay(exerciseId, dayId);
      if (!exercise) {
        this.loggerService.warn(`Exercise with ID ${exerciseId} not found in day ${dayId}.`);
        return false;
      }

      await this.exerciseRepository.deleteExercise(exerciseId);
      this.loggerService.info(
        `Exercise with ID ${exerciseId} deleted in day ${dayId} for user ${userId}.`,
      );
      return true;
    } catch (error: any) {
      if (error instanceof HTTPError) {
        throw error;
      }
      this.loggerService.error(`Error in deleteExerciseService: ${error.message}`);
      throw new HTTPError(500, 'Internal Server Error');
    }
  }
}
