import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../common/base.controller';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { ILogger } from '../../log/logger.interface';
import 'reflect-metadata';
import { ProgramService } from './program.service';
import { ProgramDto } from './dto/program.dto';
import passport from 'passport';
import { HTTPError } from '../../errors/http-error.class';
import { ValidateMiddleware } from '../../common/validate.middleware';
import { IProgramController } from './program.controller.interface';

@injectable()
export class ProgramController extends BaseController implements IProgramController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.ProgramService) private programService: ProgramService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/',
				method: 'get',
				func: this.getProgramsController,
				middlewares: [passport.authenticate('jwt', { session: false })],
			},
			{
				path: '/',
				method: 'post',
				func: this.createProgramController,
				middlewares: [passport.authenticate('jwt', { session: false }), new ValidateMiddleware(ProgramDto)],
			},
			{
				path: '/:ProgramId',
				method: 'put',
				func: this.updateProgramController,
				middlewares: [passport.authenticate('jwt', { session: false }), new ValidateMiddleware(ProgramDto)],
			},
			{
				path: '/:ProgramId',
				method: 'delete',
				func: this.deleteProgramController,
				middlewares: [passport.authenticate('jwt', { session: false })],
			},
		]);
	}

	async getProgramsController(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const user = req.user as { id: number };
			const userId = user.id;
			if (!userId) {
				return next(new HTTPError(401, 'Unauthorized'));
			}
			const result = await this.programService.getProgramsService(userId);
			this.loggerService.info(`User ${userId} retrieved all programs.`);
			this.ok(res, result);
		} catch (error: any) {
			this.loggerService.error(`Error in getProgramsController: ${error.message}`);
			next(error);
		}
	}

	async createProgramController(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const programDto: ProgramDto = req.body;
			const user = req.user as { id: number };
			const userId = user.id;
			if (!userId) {
				return next(new HTTPError(401, 'Unauthorized'));
			}
			const createdProgram = await this.programService.createProgramService(programDto, userId);
			this.loggerService.info(`User ${userId} created a new program.`);
			this.ok(res, createdProgram);
		} catch (error: any) {
			this.loggerService.error(`Error in createProgramController: ${error.message}`);
			next(error);
		}
	}

	async updateProgramController(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const programDto: ProgramDto = req.body;
			const user = req.user as { id: number };
			const userId = user.id;
			const programId = parseInt(req.params.ProgramId, 10);

			if (!userId) {
				return next(new HTTPError(401, 'Unauthorized'));
			}

			if (isNaN(programId)) {
				return next(new HTTPError(400, 'Invalid program ID'));
			}

			const updatedProgram = await this.programService.updateProgramService(programId, programDto, userId);
			this.loggerService.info(`User ${userId} updated program with ID ${programId}.`);
			this.ok(res, updatedProgram);
		} catch (error: any) {
			this.loggerService.error(`Error in updateProgramController: ${error.message}`);
			next(error);
		}
	}

	async getProgramController(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const user = req.user as { id: number };
			const userId = user.id;
			const programId = parseInt(req.params.ProgramId, 10);

			if (!userId) {
				return next(new HTTPError(401, 'Unauthorized'));
			}

			if (isNaN(programId)) {
				return next(new HTTPError(400, 'Invalid program ID'));
			}

			const getProgram = await this.programService.getProgramService(programId, userId);
			this.loggerService.info(`User ${userId} retrieved program with ID ${programId}.`);
			this.ok(res, getProgram);
		} catch (error: any) {
			this.loggerService.error(`Error in getProgramController: ${error.message}`);
			next(error);
		}
	}

	async deleteProgramController(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const user = req.user as { id: number };
			const userId = user.id;
			const programId = parseInt(req.params.ProgramId, 10);

			if (!userId) {
				return next(new HTTPError(401, 'Unauthorized'));
			}

			if (isNaN(programId)) {
				return next(new HTTPError(400, 'Invalid program ID'));
			}

			const result = await this.programService.deleteProgramService(programId, userId);
			if (!result) {
				this.loggerService.warn(`Failed to delete program with ID ${programId}.`);
				return next(new HTTPError(404, 'Program not found'));
			}
			this.loggerService.info(`Program with ID ${programId} deleted.`);
			this.ok(res, { message: 'Program deleted', programId });
		} catch (error) {
			next(error);
		}
	}
}
