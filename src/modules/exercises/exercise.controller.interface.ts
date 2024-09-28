import { NextFunction, Request, Response } from 'express';

export interface IExerciseController {
	getExercisesController: (req: Request, res: Response, next: NextFunction) => void;
	createExerciseController: (req: Request, res: Response, next: NextFunction) => void;
	updateExerciseController: (req: Request, res: Response, next: NextFunction) => void;
	getExerciseController: (req: Request, res: Response, next: NextFunction) => void;
	deleteExerciseController: (req: Request, res: Response, next: NextFunction) => void;
}

