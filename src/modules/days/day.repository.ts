import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { PrismaService } from '../../database/prisma.service';
import { IDayRepository } from './day.repository.interface';
import { WorkoutDayModel } from '@prisma/client';
import { DayDto } from './dto/day.dto';
import { DayEntity } from './entity/day.entity';
import { DayWithExercise } from './types/DayWithExercise';
import { DayWithExercisesDto } from './dto/DayWithExercises.dto';

@injectable()
export class DayRepository implements IDayRepository {
	constructor(@inject(TYPES.PrismaService) private prismaService: PrismaService) {}

	async getDaysRepository(programId: number, userId: number): Promise<DayWithExercise[]> {
		return this.prismaService.client.workoutDayModel.findMany({
			where: {
				workoutProgramId: programId,
				workoutProgram: {
					userId: userId,
				},
			},
			include: {
				exercises: true,
			},
		});
	}

	async findDayByIdAndUser(dayId: number, userId: number): Promise<WorkoutDayModel | null> {
		return this.prismaService.client.workoutDayModel.findFirst({
			where: {
				id: dayId,
				workoutProgram: {
					userId: userId,
				},
			},
		});
	}

	async createDayRepository(dto: DayDto, programId: number): Promise<DayWithExercise> {
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

	async findDayById(dayId: number, programId: number): Promise<WorkoutDayModel | null> {
		return this.prismaService.client.workoutDayModel.findFirst({
			where: {
				id: dayId,
				workoutProgramId: programId,
			},
		});
	}

	async updateDayRepository(entity: DayEntity): Promise<WorkoutDayModel> {
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

	async getDayRepository(programId: number, dayId: number, userId: number): Promise<WorkoutDayModel | null> {
		return this.prismaService.client.workoutDayModel.findFirst({
			where: {
				id: dayId,
				workoutProgramId: programId,
				workoutProgram: {
					userId: userId,
				},
			},
		});
	}

	async deleteDayRepository(dayId: number): Promise<void> {
		await this.prismaService.client.workoutDayModel.delete({
			where: { id: dayId },
		});
	}
}
