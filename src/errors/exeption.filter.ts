import { NextFunction, Request, Response } from 'express';
import { IExeptionFilter } from './exeption.filter.interface';
import { HTTPError } from './http-error.class';
import { ILogger } from '../log/logger.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import 'reflect-metadata';

@injectable()
export class ExeptionFilter implements IExeptionFilter {
  constructor(@inject(TYPES.ILogger) private logger: ILogger) {}

  catch(err: Error | HTTPError, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof HTTPError) {
      const context = err.context ? `[${err.context}]` : '';
      this.logger.error(`${context}Error${err.statusCode}:${err.message}`);
      res.status(err.statusCode).json({ err: err.message });
    } else {
      this.logger.error(`${err.message}`);
      res.status(500).json({ err: err.message });
    }
  }
}
