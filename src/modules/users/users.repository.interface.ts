import { EmailConfirmation, UserModel } from '@prisma/client';
import { User } from './entity/user.entity';

export interface IUsersRepository {
  create(user: User): Promise<UserModel>;
  findByEmail(email: string): Promise<UserModel | null>;
  findByUniqueLogin(uniqueLogin: string): Promise<UserModel | null>;
  getAll(): Promise<UserModel[]>;
  getById(id: number): Promise<UserModel | null>;
  deleteById(id: number): Promise<UserModel | null>;
  createEmailConfirmation(params: {
    userId: number;
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  }): Promise<EmailConfirmation>;
  updateEmailConfirmationByUserId(params: {
    userId: number;
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  }): Promise<EmailConfirmation>;
  updateEmailConfirmation(code: string): Promise<EmailConfirmation>;
  findIsConfirmed(email: string): Promise<boolean>;
  confirmEmail(code: string): Promise<(EmailConfirmation & { user: UserModel }) | null>;
  confirmTime(code: string): Promise<(EmailConfirmation & { user: UserModel }) | null>;
}
