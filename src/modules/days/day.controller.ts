import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../common/base.controller';
import { IDayController } from './day.controller.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { ILogger } from '../../log/logger.interface';
import 'reflect-metadata';
import { ValidateMiddleware } from '../../common/validate.middleware';
import { HTTPError } from '../../errors/http-error.class';
import passport from 'passport';
import { DayService } from './day.service';
import { DayDto } from './dto/day.dto';

@injectable()
export class DayController extends BaseController implements IDayController {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.DayService) private dayService: DayService,
  ) {
    super(loggerService);
    this.bindRoutes([
      {
        path: '/:programId',
        method: 'get',
        func: this.getDaysController,
        middlewares: [passport.authenticate('jwt', { session: false })],
      },
      {
        path: '/:programId',
        method: 'post',
        func: this.createDayController,
        middlewares: [passport.authenticate('jwt', { session: false }), new ValidateMiddleware(DayDto)],
      },
      {
        path: '/:programId/days/:dayId',
        method: 'put',
        func: this.updateDayController,
        middlewares: [passport.authenticate('jwt', { session: false }), new ValidateMiddleware(DayDto)],
      },
      {
        path: '/:programId/days/:dayId',
        method: 'get',
        func: this.getDayController,
        middlewares: [passport.authenticate('jwt', { session: false })],
      },
      {
        path: '/:programId/days/:dayId',
        method: 'delete',
        func: this.deleteDayController,
        middlewares: [passport.authenticate('jwt', { session: false })],
      }
      
    ]);
  }

  async getDaysController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const programId = parseInt(req.params.programId, 10);

      if (!userId) {
        return next(new HTTPError(401, 'Unauthorized'));
      }

      if (isNaN(programId)) {
        return next(new HTTPError(400, 'Invalid program ID'));
      }

      const result = await this.dayService.getDaysService(programId, userId);
      this.loggerService.info(`User ${userId} retrieved days for program ${programId}.`);
      this.ok(res, result);
    } catch (error: any) {
      this.loggerService.error(`Error in getDaysController: ${error.message}`);
      next(error);
    }
  }

  async createDayController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dayDto: DayDto = req.body;
      const userId = req.user?.id;
      const programId = parseInt(req.params.programId, 10);

      if (!userId) {
        return next(new HTTPError(401, 'Unauthorized'));
      }

      if (isNaN(programId)) {
        return next(new HTTPError(400, 'Invalid program ID'));
      }

      const result = await this.dayService.createDayService(dayDto, programId, userId);
      this.loggerService.info(`User ${userId} created a day in program ${programId}.`);
      this.ok(res, result);
    } catch (error: any) {
      this.loggerService.error(`Error in createDayController: ${error.message}`);
      next(error);
    }
  }

  async updateDayController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dayDto: DayDto = req.body;
      const userId = req.user?.id;
      const programId = parseInt(req.params.programId, 10);
      const dayId = parseInt(req.params.dayId, 10);

      if (!userId) {
        return next(new HTTPError(401, 'Unauthorized'));
      }
      if (isNaN(programId) || isNaN(dayId)) {
        return next(new HTTPError(400, 'Invalid program or day ID'));
      }

      const updatedDay = await this.dayService.updateDayService(dayDto, programId, dayId, userId);
      this.loggerService.info(`User ${userId} updated day with ID ${dayId} in program with ID ${programId}.`);
      this.ok(res, updatedDay);
    } catch (error: any) {
      this.loggerService.error(`Error in updateDayController: ${error.message}`);
      next(error);
    }
  }

  async getDayController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const programId = parseInt(req.params.programId, 10);
      const dayId = parseInt(req.params.dayId, 10);

      if (!userId) {
        return next(new HTTPError(401, 'Unauthorized'));
      }

      if (isNaN(programId) || isNaN(dayId)) {
        return next(new HTTPError(400, 'Invalid program or day ID'));
      }

      const result = await this.dayService.getDayService(programId, dayId, userId);
      this.loggerService.info(`User ${userId} retrieved day with ID ${dayId}.`);
      this.ok(res, result);
    } catch (error: any) {
      this.loggerService.error(`Error in getDayController: ${error.message}`);
      next(error);
    }
  }

  async deleteDayController(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const programId = parseInt(req.params.programId, 10);
      const dayId = parseInt(req.params.dayId, 10);
  
      if (!userId) {
        return next(new HTTPError(401, 'Unauthorized'));
      }
  
      if (isNaN(programId) || isNaN(dayId)) {
        return next(new HTTPError(400, 'Invalid program or day ID'));
      }
  

      await this.dayService.deleteDayService(programId, dayId, userId);
  
      this.loggerService.info(`User ${userId} deleted day with ID ${dayId} in program ${programId}.`);
      this.ok(res, { message: 'Day deleted', dayId });
    } catch (error) {
      this.loggerService.error(`Error in deleteDayController`);
      next(error);
    }
  }
  
  
}
