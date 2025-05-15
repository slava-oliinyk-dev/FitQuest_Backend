import { EmailConfirmation, UserModel } from '@prisma/client';
import { User } from './entity/user.entity';

export interface IUsersRepository {
	create(user: User): Promise<UserModel>;
	createEmailConfirmation(emailConfirmation: { confirmationCode: string; expirationDate: Date; isConfirmed: boolean; userId: number }): Promise<EmailConfirmation>;
	findByEmail(email: string): Promise<UserModel | null>;
	findByUniqueLogin(uniqueLogin: string): Promise<UserModel | null>;
	getAll(): Promise<UserModel[]>;
	getById(id: number): Promise<UserModel | null>;
	deleteById(id: number): Promise<UserModel | null>;
	confirmEmail(code: string): Promise<(EmailConfirmation & { user: UserModel }) | null>;
	updateEmailConfirmation(code: string, data: { isConfirmed: boolean }): Promise<EmailConfirmation | null>;
	confirmTime(code: string): Promise<EmailConfirmation | null>;
	findIsConfirmed(email: string): Promise<EmailConfirmation | null>;
}
