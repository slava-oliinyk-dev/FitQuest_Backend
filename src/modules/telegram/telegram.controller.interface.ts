import { NextFunction, Request, Response } from 'express';

export interface ITelegramController {
	sendConsultationController: (req: Request, res: Response, next: NextFunction) => void;
}
