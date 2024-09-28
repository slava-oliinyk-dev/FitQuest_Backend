import { inject, injectable } from 'inversify';
import { UserDto } from './dto/user.dto';
import { User } from './entity/user.entity';
import { IUserService } from './users.service.interface';
import { IConfigService } from '../../config/config.service.interface';
import { TYPES } from '../../types';
import { IUsersRepository } from './users.repository.interface';
import { Role, UserModel } from '@prisma/client';
import { HTTPError } from '../../errors/http-error.class';
import { ILogger } from '../../log/logger.interface';
import 'reflect-metadata';
import { IProgramRepository } from '../programs/program.repository.interface';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.ConfigService) private configService: IConfigService,
    @inject(TYPES.UsersRepository) private usersRepository: IUsersRepository,
    @inject(TYPES.ProgramRepository) private programRepository: IProgramRepository,
    @inject(TYPES.ILogger) private loggerService: ILogger,
  ) {}

  async createUser(dto: UserDto): Promise<UserModel | null> {
    const userRole: Role = dto.role === 'ADMIN' ? Role.ADMIN : Role.USER;

    const newUser = new User(
      dto.email!,
      dto.name!,
      dto.uniqueLogin!,
      dto.photo ?? null,
      dto.bio ?? null,
      userRole,
    );
    const salt = this.configService.get('SALT');

    await newUser.setPassword(dto.password!, Number(salt));

    const existedUserByEmail = await this.usersRepository.findByEmail(dto.email!);
    const existedUserByLogin = await this.usersRepository.findByUniqueLogin(dto.uniqueLogin!);

    if (existedUserByEmail || existedUserByLogin) {
      this.loggerService.warn(`Attempt to create a user with existing email or unique login.`);
      return null;
    }

    const createdUser = await this.usersRepository.create(newUser);
    this.loggerService.info(`User with ID ${createdUser.id} created.`);
    return createdUser;
  }

  async validateUser(dto: UserDto): Promise<UserModel | null> {
    const existedUser = await this.usersRepository.findByEmail(dto.email!);
    if (!existedUser) {
      this.loggerService.warn(`User with email ${dto.email} not found.`);
      return null;
    }

    const user = new User(
      existedUser.email,
      existedUser.name,
      existedUser.uniqueLogin,
      existedUser.photo,
      existedUser.bio,
      existedUser.role,
      existedUser.password,
    );

    const isPasswordValid = await user.comparePassword(dto.password!);
    if (!isPasswordValid) {
      this.loggerService.warn(`Invalid password for user with email ${dto.email}.`);
      return null;
    }

    this.loggerService.info(`User with ID ${existedUser.id} successfully authenticated.`);
    return existedUser;
  }

  async getAllUsers(): Promise<UserModel[]> {
    const users = await this.usersRepository.getAll();
    if (users.length === 0) {
      this.loggerService.warn(`No users found in the system.`);
      throw new HTTPError(404, 'No users available');
    }
    this.loggerService.info(`Retrieved all users.`);
    return users;
  }

  async getUserById(id: number): Promise<UserModel | null> {
    const user = await this.usersRepository.getById(id);
    if (!user) {
      this.loggerService.warn(`User with ID ${id} not found.`);
      return null;
    }
    this.loggerService.info(`Retrieved user with ID ${id}.`);
    return user;
  }

  async getUserInfo(email: string): Promise<UserModel | null> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      this.loggerService.warn(`User with email ${email} not found.`);
      return null;
    }
    this.loggerService.info(`Retrieved user info for email ${email}.`);
    return user;
  }


  async deleteUserById(id: number): Promise<UserModel | null> {
    try {
      const user = await this.usersRepository.getById(id);
      if (!user) {
        this.loggerService.warn(`User with ID ${id} not found.`);
        throw new HTTPError(404, 'User not found');
      }
      
      const deletedUser = await this.usersRepository.deleteById(id);
      this.loggerService.info(`User with ID ${id} and all related records deleted.`);
      return deletedUser;
    } catch (error: any) {
      if (error instanceof HTTPError) {
        throw error;
      }
      this.loggerService.error(`Error in deleteUserById: ${error.message}`);
      throw new HTTPError(500, 'Internal Server Error');
    }
  }
  
}
