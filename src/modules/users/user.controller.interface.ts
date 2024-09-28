import { NextFunction, Request, Response } from 'express';

export interface IUserController {
  login(req: Request, res: Response, next: NextFunction): void;
  register(req: Request, res: Response, next: NextFunction): void;
  getUsers(req: Request, res: Response, next: NextFunction): void;
  getUserById(req: Request, res: Response, next: NextFunction): void;
  deleteUserById(req: Request, res: Response, next: NextFunction): void;
}
