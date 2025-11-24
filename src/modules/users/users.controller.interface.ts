import { NextFunction, Request, Response } from 'express';

export interface IUserController {
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  register(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
  getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): Promise<void>;
  firebaseAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
  confirmEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
  reEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
  firebaseRedirect(req: Request, res: Response, next: NextFunction): Promise<void>;
}
