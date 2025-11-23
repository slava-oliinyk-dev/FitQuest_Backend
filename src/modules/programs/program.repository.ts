import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { PrismaService } from '../../database/prisma.service';
import { IProgramRepository } from './program.repository.interface';
import { WorkoutProgramModel } from '@prisma/client';
import { ProgramDto } from './dto/program.dto';
import { ProgramEntity } from './entity/program.entity';
import { WorkoutWithDay } from './types/WorkoutWithDay';

@injectable()
export class ProgramRepository implements IProgramRepository {
  constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

  async getProgramsRepository(userId: number): Promise<WorkoutWithDay[]> {
    return this.prismaService.client.workoutProgramModel.findMany({
      where: { userId },
      include: {
        workoutDays: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async createProgramRepository(dto: ProgramDto, userId: number): Promise<WorkoutWithDay> {
    return this.prismaService.client.workoutProgramModel.create({
      data: {
        title: dto.title,
        userId: userId,
      },
      include: {
        workoutDays: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async updateProgramRepository(id: number, entity: ProgramEntity): Promise<WorkoutProgramModel> {
    return this.prismaService.client.workoutProgramModel.update({
      where: {
        id_userId: { id: id, userId: entity.userId },
      },
      data: {
        title: entity.title,
      },
    });
  }

  async findProgramById(id: number, userId: number): Promise<WorkoutProgramModel | null> {
    return this.prismaService.client.workoutProgramModel.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });
  }

  async deleteProgramRepository(
    programId: number,
    userId: number,
  ): Promise<WorkoutProgramModel | null> {
    return this.prismaService.client.workoutProgramModel.delete({
      where: {
        id_userId: { id: programId, userId: userId },
      },
    });
  }

  async findProgramWithUserLogin(
    programId: number,
    userId: number,
  ): Promise<WorkoutProgramModel | null> {
    return this.prismaService.client.workoutProgramModel.findUnique({
      where: { id: programId, userId: userId },
      include: { user: { select: { uniqueLogin: true } } },
    });
  }
}
