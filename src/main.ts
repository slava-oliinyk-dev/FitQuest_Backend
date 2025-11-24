import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app';
import { ExeptionFilter } from './errors/exeption.filter';
import { LoggerService } from './log/logger.service';
import { UserController } from './modules/users/users.controller';
import { TYPES } from './types';
import { ILogger } from './log/logger.interface';
import { IExeptionFilter } from './errors/exeption.filter.interface';
import { IUserController } from './modules/users/users.controller.interface';
import { IUserService } from './modules/users/users.service.interface';
import { UserService } from './modules/users/users.service';
import { IConfigService } from './config/config.service.interface';
import { ConfigService } from './config/config.service';
import { PrismaService } from './database/prisma.service';
import { IUsersRepository } from './modules/users/users.repository.interface';
import { UsersRepository } from './modules/users/users.repository';
import { PassportConfig } from './config/passport-config';
import { IProgramController } from './modules/programs/program.controller.interface';
import { IProgramService } from './modules/programs/program.service.interface';
import { IProgramRepository } from './modules/programs/program.repository.interface';
import { ProgramController } from './modules/programs/program.controller';
import { ProgramService } from './modules/programs/program.service';
import { ProgramRepository } from './modules/programs/program.repository';
import { IDayController } from './modules/days/day.controller.interface';
import { IDayService } from './modules/days/day.service.interface';
import { IDayRepository } from './modules/days/day.repository.interface';
import { DayController } from './modules/days/day.controller';
import { DayService } from './modules/days/day.service';
import { DayRepository } from './modules/days/day.repository';
import { IExerciseController } from './modules/exercises/exercise.controller.interface';
import { IExerciseService } from './modules/exercises/exercise.service.interface';
import { IExerciseRepository } from './modules/exercises/exercise.repository.interface';
import { ExerciseController } from './modules/exercises/exercise.controller';
import { ExerciseService } from './modules/exercises/exercise.service';
import { ExerciseRepository } from './modules/exercises/exercise.repository';
import { ITelegramRepository } from './modules/telegram/telegram.repository.interface';
import { ITelegramService } from './modules/telegram/telegram.service.interface';
import { ITelegramController } from './modules/telegram/telegram.controller.interface';
import { TelegramRepository } from './modules/telegram/telegram.repository';
import { TelegramService } from './modules/telegram/telegram.service';
import { TelegramController } from './modules/telegram/telegram.controller';

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
  bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
  bind<IExeptionFilter>(TYPES.ExeptionFilter).to(ExeptionFilter);
  bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope();
  bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
  bind<PassportConfig>(TYPES.PassportConfig).to(PassportConfig);

  bind<IUserController>(TYPES.UserController).to(UserController);
  bind<IUserService>(TYPES.UserService).to(UserService);
  bind<IUsersRepository>(TYPES.UsersRepository).to(UsersRepository).inSingletonScope();

  bind<IProgramController>(TYPES.ProgramController).to(ProgramController);
  bind<IProgramService>(TYPES.ProgramService).to(ProgramService);
  bind<IProgramRepository>(TYPES.ProgramRepository).to(ProgramRepository).inSingletonScope();

  bind<IDayController>(TYPES.DayController).to(DayController);
  bind<IDayService>(TYPES.DayService).to(DayService);
  bind<IDayRepository>(TYPES.DayRepository).to(DayRepository).inSingletonScope();

  bind<IExerciseController>(TYPES.ExerciseController).to(ExerciseController);
  bind<IExerciseService>(TYPES.ExerciseService).to(ExerciseService);
  bind<IExerciseRepository>(TYPES.ExerciseRepository).to(ExerciseRepository).inSingletonScope();

  bind<ITelegramRepository>(TYPES.TelegramRepository).to(TelegramRepository).inSingletonScope();
  bind<ITelegramService>(TYPES.TelegramService).to(TelegramService);
  bind<ITelegramController>(TYPES.TelegramController).to(TelegramController);

  bind<App>(TYPES.Application).to(App);
});

function bootstrap() {
  const appContainer = new Container();
  appContainer.load(appBindings);
  const app = appContainer.get<App>(TYPES.Application);
  app.init();
  return { appContainer, app };
}

export const { app, appContainer } = bootstrap();
