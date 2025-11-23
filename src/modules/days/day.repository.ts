import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { PrismaService } from '../../database/prisma.service';
import { IDayRepository } from './day.repository.interface';
import { WorkoutDayModel } from '@prisma/client';
import { DayDto } from './dto/day.dto';
import { DayEntity } from './entity/day.entity';
import { DayWithExercise } from './types/DayWithExercise';

@injectable()
export class DayRepository implements IDayRepository {
  constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

  async getDaysByProgramAndUser(programId: number, userId: number): Promise<DayWithExercise[]> {
    return this.prismaService.client.workoutDayModel.findMany({
      where: {
        workoutProgramId: programId,
        workoutProgram: {
          userId,
        },
      },
      include: {
        exercises: true,
      },
    });
  }

  async getDayByIdAndProgram(dayId: number, programId: number): Promise<WorkoutDayModel | null> {
    return this.prismaService.client.workoutDayModel.findFirst({
      where: {
        id: dayId,
        workoutProgramId: programId,
      },
    });
  }

  async findDayByIdAndUser(dayId: number, userId: number): Promise<WorkoutDayModel | null> {
    return this.prismaService.client.workoutDayModel.findFirst({
      where: {
        id: dayId,
        workoutProgram: {
          userId,
        },
      },
    });
  }

  async createDay(programId: number, dto: DayDto): Promise<DayWithExercise> {
    return this.prismaService.client.workoutDayModel.create({
      data: {
        dayName: dto.dayName,
        muscle: dto.muscle,
        workoutProgramId: programId,
      },
      include: {
        exercises: true,
      },
    });
  }

  async getDayByIdAndUser(
    dayId: number,
    programId: number,
    userId: number,
  ): Promise<DayWithExercise | null> {
    return this.prismaService.client.workoutDayModel.findFirst({
      where: {
        id: dayId,
        workoutProgramId: programId,
        workoutProgram: {
          userId,
        },
      },
      include: {
        exercises: true,
      },
    });
  }

  async updateDay(entity: DayEntity): Promise<WorkoutDayModel> {
    return this.prismaService.client.workoutDayModel.update({
      where: {
        id_workoutProgramId: {
          id: entity.id,
          workoutProgramId: entity.workoutProgramId,
        },
      },
      data: {
        dayName: entity.dayName,
        muscle: entity.muscle,
      },
    });
  }

  async deleteDay(dayId: number): Promise<void> {
    await this.prismaService.client.workoutDayModel.delete({
      where: { id: dayId },
    });
  }
}
