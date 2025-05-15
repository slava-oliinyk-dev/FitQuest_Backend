import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { IConfigService } from '../../config/config.service.interface';
import { HTTPError } from '../../errors/http-error.class';
import { PrismaService } from '../../database/prisma.service';
import { IProgramService } from './program.service.interface';
import { IProgramRepository } from './program.repository.interface';
import { ProgramDto } from './dto/program.dto';
import { ProgramEntity } from './entity/program.entity';
import { ILogger } from '../../log/logger.interface';
import { WorkoutProgramModel } from '@prisma/client';
import { ProgramWithDaysDto } from './dto/ProgramWithDays.dto';

@injectable()
export class ProgramService implements IProgramService {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.PrismaService) private prismaService: PrismaService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.ProgramRepository) private programRepository: IProgramRepository,
	) {}

	async getProgramsService(userId: number): Promise<ProgramWithDaysDto[]> {
		try {
			const programs = await this.programRepository.getProgramsRepository(userId);
			this.loggerService.info(`User ${userId} retrieved all programs.`);
			return programs.map((program) => {
				return {
					id: program.id,
					title: program.title,
					creationDate: program.creationDate.toISOString().split('T')[0].split('-').reverse().join('/'),
					workoutDaysCount: program.workoutDays.length,
					userName: program.user.name,
				} as ProgramWithDaysDto;
			});
		} catch (error: any) {
			this.loggerService.error(`Error in getProgramsService: ${error.message}`);
			throw new HTTPError(500, 'Internal Server Error');
		}
	}

	async createProgramService(dto: ProgramDto, userId: number): Promise<ProgramWithDaysDto> {
		try {
			const createdProgram = await this.programRepository.createProgramRepository(dto, userId);
			this.loggerService.info(`Program created with ID ${createdProgram.id} by user ${userId}.`);
			const formattedDate = createdProgram.creationDate.toLocaleDateString('en-US');
			return {
				id: createdProgram.id,
				title: createdProgram.title,
				creationDate: createdProgram.creationDate.toISOString().split('T')[0].split('-').reverse().join('/'),
				workoutDaysCount: createdProgram.workoutDays.length,
				userName: createdProgram.user.name,
			} as ProgramWithDaysDto;
		} catch (error: any) {
			this.loggerService.error(`Error in createProgramService: ${error.message}`);
			throw new HTTPError(500, 'Internal Server Error');
		}
	}

	async updateProgramService(id: number, dto: ProgramDto, userId: number): Promise<ProgramDto> {
		try {
			const program = await this.programRepository.findProgramById(id, userId);
			if (!program) {
				this.loggerService.warn(`Program with ID ${id} not found for user ${userId}.`);
				throw new HTTPError(404, 'Program not found');
			}

			const programEntity = new ProgramEntity(program.id, program.title, program.userId);
			programEntity.update({ title: dto.title });
			const updatedProgram = await this.programRepository.updateProgramRepository(id, programEntity);

			this.loggerService.info(`Program with ID ${id} updated by user ${userId}.`);

			return {
				id: updatedProgram.id,
				title: updatedProgram.title,
			} as ProgramDto;
		} catch (error: any) {
			if (error instanceof HTTPError) {
				throw error;
			}
			this.loggerService.error(`Error in updateProgramService: ${error.message}`);
			throw new HTTPError(500, 'Internal Server Error');
		}
	}

	async getProgramService(id: number, userId: number): Promise<ProgramDto> {
		try {
			const program = await this.programRepository.findProgramById(id, userId);
			if (!program) {
				this.loggerService.warn(`Program with ID ${id} not found for user ${userId}.`);
				throw new HTTPError(404, 'Program not found');
			}

			this.loggerService.info(`User ${userId} retrieved program with ID ${id}.`);

			return {
				id: program.id,
				title: program.title,
			} as ProgramDto;
		} catch (error: any) {
			if (error instanceof HTTPError) {
				throw error;
			}
			this.loggerService.error(`Error in getProgramService: ${error.message}`);
			throw new HTTPError(500, 'Internal Server Error');
		}
	}

	async deleteProgramService(programId: number, userId: number): Promise<WorkoutProgramModel | null> {
		try {
			const program = await this.programRepository.findProgramById(programId, userId);
			if (!program) {
				this.loggerService.warn(`Program with ID ${programId} not found for user ${userId}.`);
				throw new HTTPError(404, 'Program not found');
			}

			const deletedProgram = await this.programRepository.deleteProgramRepository(programId, userId);
			this.loggerService.info(`Program with ID ${programId} and all related records deleted by user ${userId}.`);

			return deletedProgram;
		} catch (error: any) {
			if (error instanceof HTTPError) {
				throw error;
			}
			this.loggerService.error(`Error in deleteProgramService: ${error.message}`);
			throw new HTTPError(500, 'Internal Server Error');
		}
	}
}
