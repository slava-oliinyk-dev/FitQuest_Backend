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
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
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
				path: '/google',
				method: 'post',
				func: this.googleAuth,
			},
			{
				path: '/email',
				method: 'post',
				func: this.email,
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
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 24 * 60 * 60 * 1000,
			});
			this.loggerService.info(`User with ID ${result!.id} successfully logged in.`);
			this.ok(res, 'Ales good');
		} catch (error) {
			next(error);
		}
	}

	async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			res.clearCookie('token', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
			});
			this.loggerService.info(`The user has successfully logged out.`);
			this.ok(res, 'Logout successful');
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
			return res.redirect('https://fitness-web-frontend-bjly2jxps-viacheslavols-projects.vercel.app/login');
		} catch (error) {
			next(error);
		}
	}

	async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { access_token } = req.body;

		if (!access_token) {
			return next(new HTTPError(400, 'Token not transferred'));
		}

		try {
			const client = new OAuth2Client();
			const ticket = await client.getTokenInfo(access_token);

			if (!ticket || !ticket.email) {
				this.loggerService.warn('Failed to verify Google token');
				return next(new HTTPError(401, 'Invalid Google Token'));
			}

			const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
				headers: { Authorization: `Bearer ${access_token}` },
			});

			const { email, name, picture } = googleResponse.data;

			let user = await this.userService.getUserInfo(email);

			if (!user) {
				user = await this.userService.createUser({
					email,
					name: name || 'Google User',
					uniqueLogin: email.split('@')[0] + Date.now(),
					photo: picture,
					password: undefined,
					role: 'USER',
				});
				if (!user) {
					this.loggerService.warn(`Error creating user ${email}`);
					return next(new HTTPError(500, 'Error creating user'));
				}
			}

			const jwt = await this.signJWT(user.id, user.email, this.configService.get('SECRET'));
			res.cookie('token', jwt, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 24 * 60 * 60 * 1000,
			});

			this.loggerService.info(`User ${email} has been successfully logged in via Google`);
			this.ok(res, { message: 'Authorization via Google is successful', user });
		} catch (error: any) {
			this.loggerService.error(`Google Authorization Error: ${error.message}`);
			next(new HTTPError(500, 'Google Authorization Error'));
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
