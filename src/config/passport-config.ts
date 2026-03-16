import 'reflect-metadata';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { PassportStatic } from 'passport';
import { IConfigService } from './config.service.interface';
import { IUserService } from '../modules/users/users.service.interface';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

import { Request } from 'express';

function cookieExtractor(req: Request): string | null {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['token'];
  }
  return token;
}

@injectable()
export class PassportConfig {
  constructor(
    @inject(TYPES.ConfigService) private configService: IConfigService,
    @inject(TYPES.UserService) private userService: IUserService,
  ) {}

  public initialize(passport: PassportStatic): void {
    const jwtFromRequest = ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      cookieExtractor,
    ]);

    const opts: StrategyOptions = {
      jwtFromRequest,
      secretOrKey: this.configService.get('SECRET'),
    };

    passport.use(
      new JwtStrategy(opts, async (jwtPayload, done) => {
        try {
          const user = await this.userService.getUserInfo(jwtPayload.email);
          if (user) {
            return done(null, user);
          }

          return done(null, false);
        } catch (error) {
          return done(error, false);
        }
      }),
    );
  }
}
