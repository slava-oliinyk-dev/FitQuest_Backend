import { EmailConfirmation, UserModel } from '@prisma/client';
import { User } from './entity/user.entity';
import { IUsersRepository } from './users.repository.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { PrismaService } from '../../database/prisma.service';
import { ILogger } from '../../log/logger.interface';
import 'reflect-metadata';

@injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @inject(TYPES.ILogger) private loggerService: ILogger,
    @inject(TYPES.PrismaService) private prismaService: PrismaService,
  ) {}

  async create(user: User): Promise<UserModel> {
    return this.prismaService.client.userModel.create({
      data: {
        email: user.email,
        password: user.password,
        name: user.name,
        uniqueLogin: user.uniqueLogin,
        role: user.role,
        photo: user.photo,
        bio: user.bio,
      },
    });
  }

  async createEmailConfirmation(params: {
    userId: number;
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  }): Promise<EmailConfirmation> {
    return this.prismaService.client.emailConfirmation.create({
      data: params,
    });
  }

  async updateEmailConfirmationByUserId(params: {
    userId: number;
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  }): Promise<EmailConfirmation> {
    return this.prismaService.client.emailConfirmation.update({
      where: { userId: params.userId },
      data: {
        confirmationCode: params.confirmationCode,
        expirationDate: params.expirationDate,
        isConfirmed: params.isConfirmed,
      },
    });
  }

  async updateEmailConfirmation(code: string): Promise<EmailConfirmation> {
    return this.prismaService.client.emailConfirmation.update({
      where: { confirmationCode: code },
      data: { isConfirmed: true },
    });
  }

  async findIsConfirmed(email: string): Promise<boolean> {
    const record = await this.prismaService.client.emailConfirmation.findFirst({
      where: {
        isConfirmed: true,
        user: { email },
      },
    });
    return Boolean(record);
  }

  async confirmEmail(code: string): Promise<(EmailConfirmation & { user: UserModel }) | null> {
    return this.prismaService.client.emailConfirmation.findUnique({
      where: { confirmationCode: code },
      include: { user: true },
    });
  }

  async confirmTime(code: string): Promise<(EmailConfirmation & { user: UserModel }) | null> {
    const now = new Date();
    return this.prismaService.client.emailConfirmation.findFirst({
      where: {
        confirmationCode: code,
        expirationDate: { gte: now },
      },
      include: { user: true },
    });
  }

  async findByUniqueLogin(uniqueLogin: string): Promise<UserModel | null> {
    return this.prismaService.client.userModel.findFirst({ where: { uniqueLogin } });
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.prismaService.client.userModel.findFirst({ where: { email } });
  }

  async getAll(): Promise<UserModel[]> {
    return this.prismaService.client.userModel.findMany();
  }

  async getById(id: number): Promise<UserModel | null> {
    return this.prismaService.client.userModel.findUnique({ where: { id } });
  }

  async deleteById(id: number): Promise<UserModel | null> {
    return this.prismaService.client.userModel.delete({ where: { id } });
  }
}
