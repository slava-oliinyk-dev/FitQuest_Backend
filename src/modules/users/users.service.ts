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
import { UserResponseDto } from './dto/user-response.dto';
import { LoginUserDto } from './dto/login-user.dto';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.ConfigService) private configService: IConfigService,
    @inject(TYPES.UsersRepository) private usersRepository: IUsersRepository,
    @inject(TYPES.ProgramRepository) private programRepository: IProgramRepository,
    @inject(TYPES.ILogger) private loggerService: ILogger,
  ) {}

  async createUser(dto: UserDto): Promise<UserModel> {
    const userRole: Role = dto.role === 'ADMIN' ? Role.ADMIN : Role.USER;
    const newUser = new User(
      dto.email,
      dto.name,
      dto.uniqueLogin,
      dto.photo ?? null,
      dto.bio ?? null,
      userRole,
    );

    const salt = Number(this.configService.get('SALT'));
    const passwordToHash = dto.password ?? uuidv4();
    await newUser.setPassword(passwordToHash, salt);

    const existingByEmail = await this.usersRepository.findByEmail(dto.email);
    const existingByLogin = await this.usersRepository.findByUniqueLogin(dto.uniqueLogin);

    if (existingByEmail || existingByLogin) {
      this.loggerService.warn(`Attempt to create a user with existing email or unique login.`);
      throw new HTTPError(409, 'User with this email or unique login already exists');
    }
    let createdUser: UserModel;
    try {
      createdUser = await this.usersRepository.create(newUser);
    } catch (error) {
      this.loggerService.error(
        `Failed to persist user ${dto.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error instanceof HTTPError ? error : new HTTPError(500, 'Unable to create user');
    }

    if (dto.provider === 'GOOGLE') {
      await this.usersRepository.createEmailConfirmation({
        userId: createdUser.id,
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { minutes: 15 }),
        isConfirmed: true,
      });
      this.loggerService.info(`User ${createdUser.id} registered via Google—auto-confirmed.`);
      return createdUser;
    }

    const confirmationCode = uuidv4();
    const expirationDate = add(new Date(), { minutes: 15 });
    await this.usersRepository.createEmailConfirmation({
      userId: createdUser.id,
      confirmationCode,
      expirationDate,
      isConfirmed: false,
    });
    const baseUrl = this.configService.get('CONFIRMATION_BASE_URL');
    const confirmationUrl = `${baseUrl}/users/confirm-email/${confirmationCode}`;
    const messageEmail = `
<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8" /><title>Confirm Email</title></head>
  <body style="font-family:Arial,sans-serif;color:#333;line-height:1.5;padding:20px;">
    <h2>Hello, ${createdUser.name || 'friend'}!</h2>
    <p>Thank you for registering at <strong>FitQuest</strong>.</p>
    <p>To confirm your email, click the button below:</p>
    <p style="text-align:center;margin:30px 0;"><a href="${confirmationUrl}" style="display:inline-block;padding:12px 24px;font-size:16px;color:#fff;background-color:#1a73e8;border-radius:4px;text-decoration:none;">Confirm Email</a></p>
    <p>If the button doesn’t work, copy and paste this URL:</p>
    <p><small>${confirmationUrl}</small></p>
    <p style="font-size:14px;color:#666;">This link will be valid for 15 minutes.</p>
    <p style="font-size:14px;color:#999;margin-top:40px;">© 2025 FitQuest</p>
  </body>
</html>
`;
    try {
      await emailAdapter.sendEmail(createdUser.email, 'Confirm your email', messageEmail);
      this.loggerService.info(`Confirmation email sent to user ${createdUser.id}`);
      return createdUser;
    } catch (error) {
      this.loggerService.error(
        `Failed to send confirmation email for ${dto.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      await this.usersRepository.deleteById(createdUser.id);
      this.loggerService.warn(`Rolled back user ${createdUser.id} after email send failure.`);

      throw error instanceof HTTPError
        ? error
        : new HTTPError(503, 'Unable to send confirmation email. Please try again later.');
    }
  }

  async validateUser(dto: LoginUserDto): Promise<UserModel> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      this.loggerService.warn(`User with email ${dto.email} not found.`);
      throw new HTTPError(404, 'User not found');
    }
    const isPasswordValid = await new User(
      user.email,
      user.name,
      user.uniqueLogin,
      user.photo,
      user.bio,
      user.role,
      user.password!,
    ).comparePassword(dto.password);

    if (!isPasswordValid) {
      this.loggerService.warn(`Invalid password for user ${dto.email}`);
      throw new HTTPError(401, 'Invalid login or password');
    }
    if (!(await this.usersRepository.findIsConfirmed(dto.email))) {
      this.loggerService.warn('Email not confirmed');
      throw new HTTPError(401, 'You need to confirm your email');
    }
    this.loggerService.info(`User ${user.id} authenticated successfully.`);
    return user;
  }
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.getAll();
    if (users.length === 0) {
      this.loggerService.warn(`No users found in the system.`);
      throw new HTTPError(404, 'No users available');
    }

    return users.map(
      (u) =>
        new UserResponseDto({
          id: u.id,
          email: u.email,
          uniqueLogin: u.uniqueLogin,
          role: u.role,
          photo: u.photo,
          bio: u.bio,
        }),
    );
  }
  async getUserById(id: number): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.getById(id);
    if (!user) {
      this.loggerService.warn(`User with ID ${id} not found.`);
      return null;
    }
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      uniqueLogin: user.uniqueLogin,
      role: user.role,
      photo: user.photo,
      bio: user.bio,
    });
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
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      this.loggerService.warn(`User with email ${email} not found.`);
      throw new HTTPError(404, 'This user is not registered.');
    }
    const confirmed = await this.usersRepository.findIsConfirmed(email);
    if (confirmed) {
      this.loggerService.warn(`Your email has already been confirmed: ${email}`);
      throw new HTTPError(400, 'Your email has already been confirmed.');
    }

    const confirmationCode = uuidv4();
    const expirationDate = add(new Date(), { minutes: 15 });
    await this.usersRepository.updateEmailConfirmationByUserId({
      userId: user.id,
      confirmationCode,
      expirationDate,
      isConfirmed: false,
    });

    const baseUrl = this.configService.get('CONFIRMATION_BASE_URL');
    const confirmationUrl = `${baseUrl}/users/confirm-email/${confirmationCode}`;
    const messageEmail = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Resend Email Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px;">
        <h2 style="margin-top: 0;">Hello, ${user.name || 'friend'}!</h2>
        <p>You asked us to resend the link to confirm your email on <strong>FitQuest</strong>.</p>
        <p>To confirm your address, click the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a
            href="${confirmationUrl}"
            style="display:inline-block;padding:12px 24px;font-size:16px;color:#ffffff;background-color:#f39c12;border-radius:4px;text-decoration:none;"
          >
            Confirm Email
          </a>
        </p>
        <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
        <p style="word-break:break-all;"><small>${confirmationUrl}</small></p>
        <p style="font-size:14px; color:#666;">This link will be valid for 15 minutes.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:40px 0;" />
        <p style="font-size:14px; color:#666;">
          If you didn’t request this link, just ignore this email.<br/>
          Need help? Contact us at <a href="mailto:fitquestde@gmail.com">fitquestde@gmail.com</a>
        </p>
        <p style="font-size:14px; color:#999; margin-top:40px;">© 2025 FitQuest. All rights reserved.</p>
      </body>
    </html>
    `;
    const subject = 'Resend: Confirm Your Email Address';
    this.loggerService.info(`Sending resend email to: ${email}`);
    await emailAdapter.sendEmail(email, subject, messageEmail);

    this.loggerService.info(`Resend email successfully sent to ${email}`);
    return user;
  }
  async confirmEmail(code: string): Promise<UserModel> {
    const record = await this.usersRepository.confirmEmail(code);
    if (!record) throw new HTTPError(404, 'Invalid confirmation code');
    if (!(await this.usersRepository.confirmTime(code)))
      throw new HTTPError(400, 'Confirmation code expired');
    await this.usersRepository.updateEmailConfirmation(code);
    this.loggerService.info(`Email confirmed for user ${record.user.id}`);
    return record.user;
  }
}
