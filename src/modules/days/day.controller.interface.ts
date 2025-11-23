import { NextFunction, Request, Response } from 'express';

export interface IDayController {
  getDaysController: (req: Request, res: Response, next: NextFunction) => void;
  createDayController: (req: Request, res: Response, next: NextFunction) => void;
  updateDayController: (req: Request, res: Response, next: NextFunction) => void;
  getDayController: (req: Request, res: Response, next: NextFunction) => void;
  deleteDayController: (req: Request, res: Response, next: NextFunction) => void;
}
