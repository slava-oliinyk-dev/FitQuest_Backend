import { NextFunction, Request, Response } from 'express';

export interface ITelegramController {
	consultation: (req: Request, res: Response, next: NextFunction) => void;
}
