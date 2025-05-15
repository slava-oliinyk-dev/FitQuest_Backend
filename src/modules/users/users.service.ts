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
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns/add';
import { emailAdapter } from '../../utils/mailer';

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

		const newUser = new User(dto.email!, dto.name!, dto.uniqueLogin!, dto.photo ?? null, dto.bio ?? null, userRole);
		const salt = Number(this.configService.get('SALT'));

		const passwordToHash = dto.password ? dto.password : uuidv4();
		await newUser.setPassword(passwordToHash, salt);

		const existedUserByEmail = await this.usersRepository.findByEmail(dto.email!);
		const existedUserByLogin = await this.usersRepository.findByUniqueLogin(dto.uniqueLogin!);

		if (existedUserByEmail || existedUserByLogin) {
			this.loggerService.warn(`Attempt to create a user with existing email or unique login.`);
			return null;
		}

		const createdUser = await this.usersRepository.create(newUser);

		const emailConfirmation = {
			confirmationCode: uuidv4(),
			expirationDate: add(new Date(), { minutes: 15 }),
			isConfirmed: false,
			userId: createdUser.id,
		};

		const createdEmailConfirmation = await this.usersRepository.createEmailConfirmation(emailConfirmation);

		const confirmationUrl = `http://localhost:3003/users/confirm-email/${emailConfirmation.confirmationCode}`;

		const messageEmail = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Confirm Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px;">
        <h2 style="margin-top: 0;">Hello, ${createdUser.name || 'friend'}!</h2>
        <p>Thank you for registering at <strong>FitQuest</strong>.</p>
        <p>To confirm your email, click the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a
            href="${confirmationUrl}"
            style="
              display: inline-block;
              padding: 12px 24px;
              font-size: 16px;
              color: #ffffff;
              background-color: #1a73e8;
              text-decoration: none;
              border-radius: 4px;
            "
          >
            Confirm Email
          </a>
        </p>
        <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all;"><small>${confirmationUrl}</small></p>
        <p style="font-size: 14px; color: #666;">
          This link will be valid for 15 minutes.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
        <p style="font-size: 14px; color: #666;">
          If you did not register on our service, simply ignore this email.<br/>
          Questions or support: <a href="mailto:fitquestde@gmail.com">fitquestde@gmail.com</a>
        </p>
        <p style="font-size: 14px; color: #999; margin-top: 40px;">
          © 2025 FitQuest. All rights reserved.
        </p>
      </body>
    </html>
    
        `;

		await emailAdapter.sendEmail(createdUser.email, 'Confirm your email', messageEmail);

		this.loggerService.info(`User with ID ${createdUser.id} created.`);
		return createdUser;
	}

	async validateUser(dto: UserDto): Promise<UserModel | null> {
		const existedUser = await this.usersRepository.findByEmail(dto.email!);
		const isConfirmed = await this.usersRepository.findIsConfirmed(dto.email!);
		if (!existedUser) {
			this.loggerService.warn(`User with email ${dto.email} not found.`);
			throw new HTTPError(404, `User not found`);
		}

		const user = new User(existedUser.email, existedUser.name, existedUser.uniqueLogin, existedUser.photo, existedUser.bio, existedUser.role, existedUser.password ?? undefined);

		const isPasswordValid = await user.comparePassword(dto.password!);
		if (!isPasswordValid) {
			this.loggerService.warn(`Invalid password for user with email ${dto.email}.`);
			throw new HTTPError(401, 'Invalid login or password');
		}

		if (!isConfirmed) {
			this.loggerService.warn('You need to confirm your email');
			throw new HTTPError(401, 'You need to confirm your email');
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

	async reEmail(email: string): Promise<UserModel | null> {
		const emailConfirmation = await this.usersRepository.findByEmail(email);
		const isConfirmed = await this.usersRepository.findIsConfirmed(email);

		if (!emailConfirmation) {
			this.loggerService.warn(`This user is not registered.`);
			throw new HTTPError(404, 'This user is not registered.');
		}

		if (isConfirmed) {
			this.loggerService.warn(`Your email has already been confirmed.`);
			throw new HTTPError(404, 'Your email has already been confirmed.');
		}

		const emailConfirmationData = {
			confirmationCode: uuidv4(),
			expirationDate: add(new Date(), { minutes: 15 }),
			isConfirmed: false,
			userId: emailConfirmation.id,
		};
		await this.usersRepository.createEmailConfirmation(emailConfirmationData);
		const confirmationUrl = `http://localhost:3003/users/confirm-email/${emailConfirmationData.confirmationCode}`;
		const messageEmail = `
    <!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <title>Resend Email Confirmation</title>
      </head>
      <body style="font-family:Arial,sans-serif; color:#333; line-height:1.5; padding:20px;">
        <h2 style="margin-top:0;">Hello, ${emailConfirmation.name || 'Friend'}!</h2>
        <p>You asked us to resend the link to confirm your email on <strong>FitQuest</strong>.</p>
        <p>To confirm your address, click the button below:</p>
        <p style="text-align:center; margin:30px 0;">
          <a
            href="${confirmationUrl}"
            style="
              display:inline-block;
              padding:12px 24px;
              font-size:16px;
              color:#ffffff;
              background-color:#f39c12;
              text-decoration:none;
              border-radius:4px;
            "
          >
              Confirm Email
          </a>
        </p>
        <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
        <p style="word-break:break-all;"><small>${confirmationUrl}</small></p>
        <p style="font-size:14px; color:#666;">
              This link is valid for 15 minutes.
        </p>
        <hr style="border:none; border-top:1px solid #eee; margin:40px 0;" />
        <p style="font-size:14px; color:#666;">
          If you didn’t request this link, just ignore this email.<br/>
          Need help? Contact us at <a href="mailto:fitquestde@gmail.com">fitquestde@gmail.com</a>.
        </p>
        <p style="font-size:14px; color:#999; margin-top:40px;">
          © 2025 FitQuest. All rights reserved.
        </p>
      </body>
    </html>
    `;
		const subject = 'Resend: Confirm Your Email Address';
		this.loggerService.info(`Sending email to: ${email}`);
		await emailAdapter.sendEmail(email, subject, messageEmail);

		this.loggerService.info(`Email successfully verified (Service)`);
		return emailConfirmation;
	}

	async confirmEmail(code: string): Promise<UserModel | null> {
		const emailConfirmation = await this.usersRepository.confirmEmail(code);
		const dateConfirmation = await this.usersRepository.confirmTime(code);

		if (!emailConfirmation) {
			this.loggerService.warn(`This user is not registered.`);
			throw new HTTPError(404, 'This user is not registered.');
		}
		if (!dateConfirmation) {
			this.loggerService.warn(`Invalid date.`);
			throw new HTTPError(404, 'Invalid date.');
		}
		await this.usersRepository.updateEmailConfirmation(code, { isConfirmed: true });
		this.loggerService.info(`Email successfully verified (Service)`);

		return emailConfirmation.user;
	}
}
