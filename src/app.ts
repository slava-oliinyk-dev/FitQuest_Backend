import express, { Express } from 'express';
import cors from 'cors';
import { Server } from 'http';
import cookieParser from 'cookie-parser';
import * as admin from 'firebase-admin';
import { UserController } from './modules/users/users.controller';
import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import { ILogger } from './log/logger.interface';
import 'reflect-metadata';
import { IConfigService } from './config/config.service.interface';
import { IExeptionFilter } from './errors/exeption.filter.interface';
import { PrismaService } from './database/prisma.service';
import passport from 'passport';
import { PassportConfig } from './config/passport-config';
import { ProgramController } from './modules/programs/program.controller';
import { DayController } from './modules/days/day.controller';
import { ExerciseController } from './modules/exercises/exercise.controller';
import { TelegramController } from './modules/telegram/telegram.controller';
import path from 'path';

@injectable()
export class App {
  app: Express;
  server: Server;
  port: number;

  constructor(
    @inject(TYPES.ILogger) private logger: ILogger,
    @inject(TYPES.UserController) private userController: UserController,
    @inject(TYPES.ExeptionFilter) private exeptionFilter: IExeptionFilter,
    @inject(TYPES.ProgramController) private programController: ProgramController,
    @inject(TYPES.DayController) private dayController: DayController,
    @inject(TYPES.ExerciseController) private exerciseController: ExerciseController,
    @inject(TYPES.ConfigService) private configService: IConfigService,
    @inject(TYPES.PrismaService) private prismaService: PrismaService,
    @inject(TYPES.PassportConfig) private passportConfig: PassportConfig,
    @inject(TYPES.TelegramController) private telegramController: TelegramController,
  ) {
    this.app = express();

    const corsOrigins = this.getCorsOrigins();

    this.app.use(
      cors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.options('*', cors());

    this.app.use(express.static(path.join(__dirname, '..', 'public')));

    const serviceAccount = JSON.parse(this.configService.get('FIREBASE_SERVICE_ACCOUNT'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    this.passportConfig.initialize(passport);
    this.app.use(passport.initialize());
    this.port = Number(this.configService.get('PORT')) || 3003;
  }

  private getCorsOrigins(): string[] {
    const origins = this.configService.get('CORS_ALLOWED_ORIGINS');
    return origins
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);
  }

  private useRoutes(): void {
    this.app.use('/users', this.userController.router);
    this.app.use('/program', this.programController.router);
    this.app.use('/day', this.dayController.router);
    this.app.use('/exercise', this.exerciseController.router);
    this.app.use('/telegram', this.telegramController.router);
  }

  useExeptionFilters(): void {
    this.app.use(this.exeptionFilter.catch.bind(this.exeptionFilter));
  }

  public async init(): Promise<void> {
    this.app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
    this.useRoutes();
    this.useExeptionFilters();
    await this.prismaService.connect();
    this.server = this.app.listen(this.port);
    this.logger.log(`The server is running on ${this.port}`);
  }
}
