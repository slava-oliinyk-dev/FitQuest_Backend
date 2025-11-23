import { NextFunction, Request, Response } from 'express';

export interface IProgramController {
  getProgramsController: (req: Request, res: Response, next: NextFunction) => void;
  createProgramController: (req: Request, res: Response, next: NextFunction) => void;
  updateProgramController: (req: Request, res: Response, next: NextFunction) => void;
  getProgramController: (req: Request, res: Response, next: NextFunction) => void;
  deleteProgramController: (req: Request, res: Response, next: NextFunction) => void;
}
