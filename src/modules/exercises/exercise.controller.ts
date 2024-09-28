import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../common/base.controller';
import { IExerciseController } from './exercise.controller.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { ILogger } from '../../log/logger.interface';
import 'reflect-metadata';
import { ValidateMiddleware } from '../../common/validate.middleware';
import { HTTPError } from '../../errors/http-error.class';
import passport from 'passport';
import { ExerciseService } from './exercise.service';
import { ExerciseDto } from './dto/exercise.dto';

@injectable()
export class ExerciseController extends BaseController implements IExerciseController {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.ExerciseService) private exerciseService: ExerciseService,
  ) {
    super(loggerService);
    this.bindRoutes([
      {
        path: '/:dayId',
        method: 'get',
        func: this.getExercisesController,
        middlewares: [passport.authenticate('jwt', { session: false })],
      },
      {
        path: '/:dayId',
        method: 'post',
        func: this.createExerciseController,
        middlewares: [passport.authenticate('jwt', { session: false }), new ValidateMiddleware(ExerciseDto)],
      },
      {
        path: '/:dayId/exercises/:exerciseId',
        method: 'put',
        func: this.updateExerciseController,
        middlewares: [passport.authenticate('jwt', { session: false }), new ValidateMiddleware(ExerciseDto)],
      },
      {
        path: '/:dayId/exercises/:exerciseId',
        method: 'get',
        func: this.getExerciseController,
        middlewares: [passport.authenticate('jwt', { session: false })],
      },
      {
        path: '/:dayId/exercises/:exerciseId',
        method: 'delete',
        func: this.deleteExerciseController,
        middlewares: [passport.authenticate('jwt', { session: false })],
      }
      
    ]);
  }

  async getExercisesController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const dayId = parseInt(req.params.dayId, 10);

      if (!userId) {
        return next(new HTTPError(401, 'Unauthorized'));
      }

      if (isNaN(dayId)) {
        return next(new HTTPError(400, 'Invalid day ID'));
      }

      const result = await this.exerciseService.getExercisesService(dayId, userId);
      this.loggerService.info(`User ${userId} retrieved exercises for day ${dayId}.`);
      this.ok(res, result);
    } catch (error: any) {
      this.loggerService.error(`Error in getExercisesController: ${error.message}`);
      next(error);
    }
  }

  async createExerciseController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exerciseDto: ExerciseDto = req.body;
      const userId = req.user?.id;
      const dayId = parseInt(req.params.dayId, 10);

      if (!userId) {
        return next(new HTTPError(401, 'Unauthorized'));
      }

      if (isNaN(dayId)) {
        return next(new HTTPError(400, 'Invalid day ID'));
      }

      const result = await this.exerciseService.createExerciseService(exerciseDto, dayId, userId);
      this.loggerService.info(`User ${userId} created an exercise in day ${dayId}.`);
      this.ok(res, result);
    } catch (error: any) {
      this.loggerService.error(`Error in createExerciseController: ${error.message}`);
      next(error);
    }
  }

  async updateExerciseController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exerciseDto: ExerciseDto = req.body;
      const userId = req.user?.id;
      const dayId = parseInt(req.params.dayId, 10);
      const exerciseId = parseInt(req.params.exerciseId, 10);

      if (!userId) {
        return next(new HTTPError(401, 'Unauthorized'));
      }

      if (isNaN(dayId) || isNaN(exerciseId)) {
        return next(new HTTPError(400, 'Invalid day or exercise ID'));
      }

      const updatedExercise = await this.exerciseService.updateExerciseService(
        exerciseDto,
        dayId,
        exerciseId,
        userId,
      );
      this.loggerService.info(
        `User ${userId} updated exercise with ID ${exerciseId} in day with ID ${dayId}.`,
      );
      this.ok(res, updatedExercise);
    } catch (error: any) {
      this.loggerService.error(`Error in updateExerciseController: ${error.message}`);
      next(error);
    }
  }

  async getExerciseController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const dayId = parseInt(req.params.dayId, 10);
      const exerciseId = parseInt(req.params.exerciseId, 10);

      if (!userId) {
        return next(new HTTPError(401, 'Unauthorized'));
      }

      if (isNaN(dayId) || isNaN(exerciseId)) {
        return next(new HTTPError(400, 'Invalid day or exercise ID'));
      }

      const result = await this.exerciseService.getExerciseService(dayId, exerciseId, userId);
      this.loggerService.info(`User ${userId} retrieved exercise with ID ${exerciseId}.`);
      this.ok(res, result);
    } catch (error: any) {
      this.loggerService.error(`Error in getExerciseController: ${error.message}`);
      next(error);
    }
  }

  async deleteExerciseController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const dayId = parseInt(req.params.dayId, 10);
      const exerciseId = parseInt(req.params.exerciseId, 10);
  
      if (!userId) {
        return next(new HTTPError(401, 'Unauthorized'));
      }
  
      if (isNaN(dayId) || isNaN(exerciseId)) {
        return next(new HTTPError(400, 'Invalid day or exercise ID'));
      }
  
      const result = await this.exerciseService.deleteExerciseService(dayId, exerciseId, userId);
      if (!result) {
        this.loggerService.warn(`Exercise with ID ${exerciseId} not found in day ${dayId}.`);
        return next(new HTTPError(404, 'Exercise not found'));
      }
  
      this.loggerService.info(`User ${userId} deleted exercise with ID ${exerciseId} in day ${dayId}.`);
      this.ok(res, { message: 'Exercise deleted', exerciseId });
    } catch (error: any) {
      this.loggerService.error(`Error in deleteExerciseController: ${error.message}`);
      next(error);
    }
  }
  
}
