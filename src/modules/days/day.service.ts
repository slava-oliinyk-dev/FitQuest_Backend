import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { IConfigService } from '../../config/config.service.interface';
import { HTTPError } from '../../errors/http-error.class';
import { PrismaService } from '../../database/prisma.service';
import { IDayService } from './day.service.interface';
import { IDayRepository } from './day.repository.interface';
import { WorkoutDayModel } from '@prisma/client';
import { DayDto } from './dto/day.dto';
import { IProgramRepository } from '../programs/program.repository.interface';
import { ILogger } from '../../log/logger.interface';
import { DayEntity } from './entity/day.entity';
import { DayWithExercisesDto } from './dto/DayWithExercises.dto';

@injectable()
export class DayService implements IDayService {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.PrismaService) private prismaService: PrismaService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.DayRepository) private dayRepository: IDayRepository,
		@inject(TYPES.ProgramRepository) private programRepository: IProgramRepository,
	) {}

	async getDaysService(programId: number, userId: number): Promise<DayWithExercisesDto[]> {
		try {
			const program = await this.programRepository.findProgramById(programId, userId);
			if (!program) {
				this.loggerService.warn(`Program with ID ${programId} not found for user ${userId}.`);
				throw new HTTPError(404, 'Program not found');
			}

			const days = await this.dayRepository.getDaysRepository(programId, userId);
			this.loggerService.info(`Retrieved ${days.length} days for program ${programId} and user ${userId}.`);

			return days.map((day) => {
				return {
					id: day.id,
					dayName: day.dayName,
					muscle: day.muscle,
					creationDate: day.creationDate.toISOString().split('T')[0].split('-').reverse().join('/'),
					workoutExercisesCount: day.exercises.length,
				} as DayWithExercisesDto;
			});
		} catch (error: any) {
			if (error instanceof HTTPError) {
				throw error;
			}
			this.loggerService.error(`Error in getDaysService: ${error.message}`);
			throw new HTTPError(500, 'Internal Server Error');
		}
	}

	async createDayService(dto: DayDto, programId: number, userId: number): Promise<DayWithExercisesDto> {
		try {
			const program = await this.programRepository.findProgramById(programId, userId);
			if (!program) {
				this.loggerService.warn(`Program with ID ${programId} not found for user ${userId}.`);
				throw new HTTPError(404, 'Program not found');
			}

			const createdDay = await this.dayRepository.createDayRepository(dto, programId);
			this.loggerService.info(`Day created with ID ${createdDay.id} in program ${programId} by user ${userId}.`);

			return {
				id: createdDay.id,
				dayName: createdDay.dayName,
				muscle: createdDay.muscle,
				creationDate: createdDay.creationDate.toISOString().split('T')[0].split('-').reverse().join('/'),
				workoutExercisesCount: createdDay.exercises ? createdDay.exercises.length : 0,
			} as DayWithExercisesDto;
		} catch (error: any) {
			if (error instanceof HTTPError) {
				throw error;
			}
			this.loggerService.error(`Error in createDayService: ${error.message}`);
			throw new HTTPError(500, 'Internal Server Error');
		}
	}

	async updateDayService(dto: DayDto, programId: number, dayId: number, userId: number): Promise<DayDto> {
		try {
			const program = await this.programRepository.findProgramById(programId, userId);
			if (!program) {
				this.loggerService.warn(`Program with ID ${programId} not found for user ${userId}.`);
				throw new HTTPError(404, 'Program not found');
			}

			const day = await this.dayRepository.findDayById(dayId, programId);
			if (!day) {
				this.loggerService.warn(`Day with ID ${dayId} not found in program ${programId}.`);
				throw new HTTPError(404, 'Day not found');
			}

			const dayEntity = new DayEntity(day.id, day.dayName, day.muscle, day.workoutProgramId);
			dayEntity.update({ dayName: dto.dayName, muscle: dto.muscle });

			const updatedDay = await this.dayRepository.updateDayRepository(dayEntity);
			this.loggerService.info(`Day with ID ${dayId} updated by user ${userId}.`);

			return {
				id: updatedDay.id,
				dayName: updatedDay.dayName,
				muscle: updatedDay.muscle,
			} as DayDto;
		} catch (error: any) {
			if (error instanceof HTTPError) {
				throw error;
			}
			this.loggerService.error(`Error in updateDayService: ${error.message}`);
			throw new HTTPError(500, 'Internal Server Error');
		}
	}

	async getDayService(programId: number, dayId: number, userId: number): Promise<WorkoutDayModel> {
		try {
			const program = await this.programRepository.findProgramById(programId, userId);
			if (!program) {
				this.loggerService.warn(`Program with ID ${programId} not found for user ${userId}.`);
				throw new HTTPError(404, 'Program not found');
			}

			const day = await this.dayRepository.getDayRepository(programId, dayId, userId);
			if (!day) {
				this.loggerService.warn(`Day with ID ${dayId} not found for user ${userId} in program ${programId}.`);
				throw new HTTPError(404, 'Day not found');
			}

			this.loggerService.info(`User ${userId} retrieved day with ID ${dayId}.`);
			return day;
		} catch (error: any) {
			if (error instanceof HTTPError) {
				throw error;
			}
			this.loggerService.error(`Error in getDayService: ${error.message}`);
			throw new HTTPError(500, 'Internal Server Error');
		}
	}

	async deleteDayService(programId: number, dayId: number, userId: number): Promise<void> {
		try {
			const program = await this.programRepository.findProgramById(programId, userId);
			if (!program) {
				this.loggerService.warn(`Program with ID ${programId} not found for user ${userId}.`);
				throw new HTTPError(404, 'Program not found');
			}

			const day = await this.dayRepository.findDayById(dayId, programId);
			if (!day) {
				this.loggerService.warn(`Day with ID ${dayId} not found in program ${programId}.`);
				throw new HTTPError(404, 'Day not found');
			}

			await this.dayRepository.deleteDayRepository(dayId);
			this.loggerService.info(`Day with ID ${dayId} and all related records deleted in program ${programId} for user ${userId}.`);
		} catch (error: any) {
			if (error instanceof HTTPError) {
				throw error;
			}
			this.loggerService.error(`Error in deleteDayService: ${error.message}`);
			throw new HTTPError(500, 'Internal Server Error');
		}
	}
}
