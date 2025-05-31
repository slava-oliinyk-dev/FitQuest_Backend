import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../common/base.controller';
import { IUserController } from './user.controller.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { ILogger } from '../../log/logger.interface';
import 'reflect-metadata';
import { UserDto } from './dto/user.dto';
import * as admin from 'firebase-admin';
import { HTTPError } from '../../errors/http-error.class';
import { ValidateMiddleware } from '../../common/validate.middleware';
import { sign } from 'jsonwebtoken';
import { IConfigService } from '../../config/config.service.interface';
import { IUserService } from './users.service.interface';
import { RoleMiddleware } from '../../common/role.middleware';
import passport from 'passport';
import { emailAdapter } from '../../utils/mailer';

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
				path: '/logout',
				method: 'post',
				func: this.logout,
			},
			{
				path: '/me',
				method: 'get',
				func: this.getMe,
				middlewares: [passport.authenticate('jwt', { session: false })],
			},
			{
				path: '/',
				method: 'get',
				func: this.getUsers,
				middlewares: [passport.authenticate('jwt', { session: false }), RoleMiddleware(['USER'])],
			},	
			{
				path: '/email',
				method: 'post',
				func: this.email,
			},
			{
 				path: '/firebase-redirect',
  				method: 'get',
  				func: this.firebaseRedirect,
			},

			{
				path: '/re-email',
				method: 'post',
				func: this.reEmail,
			},
			{
				path: '/confirm-email/:code',
				method: 'get',
				func: this.confirmEmail,
			},
			{
  				path: '/firebase',
  				method: 'post',
  				func: this.firebaseAuth,
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
private getCookieOptions() {
  return {
    httpOnly: true,
    secure: true,          
    sameSite: 'none' as const,  
    path: '/',
  };
}



	async register(req: Request, res: Response, next: NextFunction): Promise<void> {
	 try {
    const dto: UserDto = {
      email: req.body.email,
      name: req.body.name,
      uniqueLogin: req.body.uniqueLogin,
      password: req.body.password,
      role: req.body.role,
      photo: req.body.photo,
      bio: req.body.bio,
      provider: 'LOCAL',          
    };

    const result = await this.userService.createUser(dto);
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
			});
		} catch (error) {
			next(error);
		}
	}

	async login(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const result = await this.userService.validateUser(req.body);
			const jwt = await this.signJWT(result!.id, result!.email, this.configService.get('SECRET'));
		      res.cookie('token', jwt, {
        ...this.getCookieOptions(),
        maxAge: 24 * 60 * 60 * 1000, 
      });
			this.loggerService.info(`User with ID ${result!.id} successfully logged in.`);
			this.ok(res, 'Ales good');
		} catch (error) {
			next(error);
		}
	}

	async firebaseAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new HTTPError(401, 'No Firebase ID token provided'));
    }
    const idToken = authHeader.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email!;
    const name = decoded.name || 'Firebase User';

    let user = await this.userService.getUserInfo(email);
    if (!user) {
		 const dto: UserDto = {
        email,
        name,
        uniqueLogin: `${email.split('@')[0]}_${Date.now()}`,
        password: undefined,
        role: 'USER',
        provider: 'GOOGLE',  
      };
    user = await this.userService.createUser(dto);
      if (!user) {
        return next(new HTTPError(500, 'Error creating user'));
      }
    }
    const jwt = await this.signJWT(user.id, user.email, this.configService.get('SECRET'));
	   res.cookie('token', jwt, {
        ...this.getCookieOptions(),
        maxAge: 24 * 60 * 60 * 1000,
      });

    this.ok(res, {
      id: user.id,
      email: user.email,
      uniqueLogin: user.uniqueLogin,
      role: user.role,
      photo: user.photo,
    });
  } catch (err: any) {
    next(new HTTPError(401, `Firebase auth error: ${err.message}`));
  }
}

async firebaseRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idToken = String(req.query.token);
    const redirect = String(req.query.redirect || '/');
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email!;
    let user = await this.userService.getUserInfo(email);
    if (!user) {
      const dto: UserDto = {
        email,
        name: decoded.name || 'Firebase User',
        uniqueLogin: `${email.split('@')[0]}_${Date.now()}`,
        password: undefined,
        role: 'USER',
        provider: 'GOOGLE',  
      };

      user = await this.userService.createUser(dto);
	   if (!user) {
        return next(new HTTPError(500, 'Error creating user'));
      }
    }
    const jwt = await this.signJWT(user.id, user.email, this.configService.get('SECRET'));
    res.cookie('token', jwt, {
      ...this.getCookieOptions(),
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.redirect(redirect);
  } catch (err: any) {
    next(new HTTPError(401, `Firebase redirect error: ${err.message}`));
  }
}


	async logout(req: Request, res: Response, next: NextFunction): Promise<void> {

		try {
		   res.clearCookie('token', this.getCookieOptions());
			this.loggerService.info(`The user has successfully logged out.`);
			this.ok(res, 'Logout successful')
		} catch (error) {
			next(error);
		}
	}

	async reEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
		const email = req.body.email;
		try {
			const result = await this.userService.reEmail(email);
			this.loggerService.info(`An email with a code has been sent to you.`);
			this.ok(res, 'The code has been sent to you.');
		} catch (error) {
			next(error);
		}
	}

	async confirmEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
		const code = req.params.code as string;
		try {
			const result = await this.userService.confirmEmail(code);
			this.loggerService.info(`You have successfully confirmed your email.`);
			return res.redirect('https://fitness-web-frontend.vercel.app/login');
		} catch (error) {
			next(error);
		}
	}

	async email(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const result = await emailAdapter.sendEmail(req.body.email, req.body.subject, req.body.message);
			this.loggerService.info(`Everything okay. Email sent`);
			this.ok(res, result);
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
			if (isNaN(id)) {
				return next(new HTTPError(400, 'Invalid identifier'));
			}
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

	async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			if (!req.user) {
				return next(new HTTPError(401, 'Not authenticated'));
			}
			this.ok(res, { user: req.user });
		} catch (error) {
			next(error);
		}
	}
}
