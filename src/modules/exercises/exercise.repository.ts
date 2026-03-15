import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { PrismaService } from '../../database/prisma.service';
import { IExerciseRepository } from './exercise.repository.interface';
import { ExerciseModel } from '@prisma/client';
import { ExerciseDto } from './dto/exercise.dto';
import { ExerciseEntity } from './entity/exercise.entity';
import { UpdateExerciseNoteDto } from './dto/updateExerciseNote.dto';

@injectable()
export class ExerciseRepository implements IExerciseRepository {
  constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

  async getExercisesByDayAndUser(dayId: number, userId: number): Promise<ExerciseModel[]> {
    return this.prismaService.client.exerciseModel.findMany({
      where: {
        workoutDayId: dayId,
        workoutDay: {
          workoutProgram: {
            userId: userId,
          },
        },
      },
    });
  }

  async findExerciseByIdAndDay(exerciseId: number, dayId: number): Promise<ExerciseModel | null> {
    return this.prismaService.client.exerciseModel.findFirst({
      where: {
        id: exerciseId,
        workoutDayId: dayId,
      },
    });
  }

  async createExercise(dayId: number, dto: ExerciseDto): Promise<ExerciseModel> {
    return this.prismaService.client.exerciseModel.create({
      data: {
        name: dto.name,
        sets: dto.sets,
        repetitions: dto.repetitions,
        weight: dto.weight,
        restTime: dto.restTime,
        note: dto.note,
        progressMark: dto.progressMark,
        workoutDayId: dayId,
      },
    });
  }

  async updateExercise(entity: ExerciseEntity): Promise<ExerciseModel> {
    return this.prismaService.client.exerciseModel.update({
      where: {
        id_workoutDayId: {
          id: entity.id,
          workoutDayId: entity.workoutDayId,
        },
      },
      data: {
        name: entity.name,
        sets: entity.sets,
        repetitions: entity.repetitions,
        weight: entity.weight,
        restTime: entity.restTime,
        note: entity.note,
        progressMark: entity.progressMark,
      },
    });
  }

  async updateExerciseNote(dto: UpdateExerciseNoteDto): Promise<ExerciseModel> {
    if (dto.id === undefined || dto.workoutDayId === undefined) {
      throw new Error('Exercise id and workoutDayId are required to update exercise note');
    }

    return this.prismaService.client.exerciseModel.update({
      where: {
        id_workoutDayId: {
          id: dto.id,
          workoutDayId: dto.workoutDayId,
        },
      },
      data: {
        note: dto.note,
      },
    });
  }

  async getExerciseByIdAndUser(
    dayId: number,
    exerciseId: number,
    userId: number,
  ): Promise<ExerciseModel | null> {
    return this.prismaService.client.exerciseModel.findFirst({
      where: {
        id: exerciseId,
        workoutDayId: dayId,
        workoutDay: {
          workoutProgram: {
            userId: userId,
          },
        },
      },
    });
  }

  async deleteExercise(exerciseId: number): Promise<void> {
    await this.prismaService.client.exerciseModel.delete({
      where: { id: exerciseId },
    });
  }
}
