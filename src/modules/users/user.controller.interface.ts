import { NextFunction, Request, Response } from 'express';

export interface IUserController {
	login(req: Request, res: Response, next: NextFunction): void;
	register(req: Request, res: Response, next: NextFunction): void;
	getUsers(req: Request, res: Response, next: NextFunction): void;
	getUserById(req: Request, res: Response, next: NextFunction): void;
	deleteUserById(req: Request, res: Response, next: NextFunction): void;
	getMe(req: Request, res: Response, next: NextFunction): void;
	logout(req: Request, res: Response, next: NextFunction): void;
	firebaseAuth(req: Request, res: Response, next: NextFunction): void;
	confirmEmail(req: Request, res: Response, next: NextFunction): void;
	reEmail(req: Request, res: Response, next: NextFunction): void;
}
