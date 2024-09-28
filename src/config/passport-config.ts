import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { PassportStatic } from 'passport';
import { IConfigService } from './config.service.interface';
import { IUserService } from '../modules/users/users.service.interface';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class PassportConfig {
	constructor(
		@inject(TYPES.ConfigService) private configService: IConfigService,
		@inject(TYPES.UserService) private userService: IUserService,
	) {}

	public initialize(passport: PassportStatic): void {
		const opts: StrategyOptions = {
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: this.configService.get('SECRET'),
		};

		passport.use(
			new JwtStrategy(opts, async (jwtPayload, done) => {
			  try {
				
				const user = await this.userService.getUserInfo(jwtPayload.email); 
				if (user) {
			
				  return done(null, { id: jwtPayload.id, email: user.email, role: user.role });
				} else {
				  return done(null, false);
				}
			  } catch (error) {
				return done(error, false);
			  }
			})
		  );
		  
	}
}
