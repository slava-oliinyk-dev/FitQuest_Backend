import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../common/base.controller';
import { IUserController } from './user.controller.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { ILogger } from '../../log/logger.interface';
import 'reflect-metadata';
import { UserDto } from './dto/user.dto';
import { HTTPError } from '../../errors/http-error.class';
import { ValidateMiddleware } from '../../common/validate.middleware';
import { sign } from 'jsonwebtoken';
import { IConfigService } from '../../config/config.service.interface';
import { IUserService } from './users.service.interface';
import { RoleMiddleware } from '../../common/role.middleware';
import passport from 'passport';

@injectable()
export class UserController extends BaseController implements IUserController {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.ConfigService) private configService: IConfigService,
  ) {
    super(loggerService);
    this.bindRoutes([
      {
        path: '/register',
        method: 'post',
        func: this.register,
        middlewares: [new ValidateMiddleware(UserDto)],
      },
      {
        path: '/login',
        method: 'post',
        func: this.login,
        middlewares: [new ValidateMiddleware(UserDto)],
      },
      {
        path: '/',
        method: 'get',
        func: this.getUsers,
        middlewares: [passport.authenticate('jwt', { session: false }), RoleMiddleware(['USER'])],
      },
      {
        path: '/:id',
        method: 'get',
        func: this.getUserById,
        middlewares: [passport.authenticate('jwt', { session: false }), RoleMiddleware(['USER'])],
      },
      {
        path: '/:id',
        method: 'delete',
        func: this.deleteUserById,
        middlewares: [passport.authenticate('jwt', { session: false }), RoleMiddleware(['USER'])],
      },
    ]);
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.userService.createUser(req.body);
      if (!result) {
        this.loggerService.warn(`User with email ${req.body.email} or unique login ${req.body.uniqueLogin} already exists.`);
        return next(new HTTPError(422, 'User with this email or unique login already exists'));
      }
      this.loggerService.info(`User with ID ${result.id} successfully registered.`);
      this.ok(res, {
        id: result.id,
        email: result.email,
        uniqueLogin: result.uniqueLogin,
        role: result.role,
        photo: result.photo,
        bio: result.bio,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.userService.validateUser(req.body);
      if (!result) {
        this.loggerService.warn(`Failed login attempt for email ${req.body.email}.`);
        return next(new HTTPError(401, 'Authorization error'));
      }
      const jwt = await this.signJWT(result.id, result.email, this.configService.get('SECRET'));
      this.loggerService.info(`User with ID ${result.id} successfully logged in.`);
      this.ok(res, { jwt });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.userService.getAllUsers();
      this.loggerService.info(`Retrieved all users. Count: ${result.length}.`);
      this.ok(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.userService.getUserById(id);
      if (!result) {
        this.loggerService.warn(`User with ID ${id} not found.`);
        return next(new HTTPError(404, 'User not found'));
      }
      this.loggerService.info(`Retrieved user with ID ${id}.`);
      this.ok(res, result);
    } catch (error) {
      next(error);
    }
  }

  async deleteUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const result = await this.userService.deleteUserById(id);
      if (!result) {
        this.loggerService.warn(`Failed to delete user with ID ${id}.`);
        return next(new HTTPError(404, 'User not found'));
      }
      this.loggerService.info(`User with ID ${id} deleted.`);
      this.ok(res, { message: 'User deleted', id });
    } catch (error) {
      next(error);
    }
  }

  private signJWT(id: number, email: string, secret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      sign(
        {
          id,
          email,
          iat: Math.floor(Date.now() / 1000),
        },
        secret,
        {
          algorithm: 'HS256',
          expiresIn: '5h',
        },
        (err, token) => {
          if (err) {
            this.loggerService.error(`Error signing JWT: ${err.message}`);
            reject(err);
          }
          resolve(token as string);
        },
      );
    });
  }
}
