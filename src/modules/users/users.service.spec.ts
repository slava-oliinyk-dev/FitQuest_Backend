import { UserService } from './users.service';
import { IConfigService } from '../../config/config.service.interface';
import { IUsersRepository } from './users.repository.interface';
import { IProgramRepository } from '../programs/program.repository.interface';
import { ILogger } from '../../log/logger.interface';
import { Role, UserModel } from '@prisma/client';
import { emailAdapter } from '../../utils/mailer';
import { UserDto } from './dto/user.dto';
import { hash } from 'bcryptjs';

type EmailAdapterMock = { sendEmail: jest.Mock };

jest.mock('../../utils/mailer', () => ({
  emailAdapter: {
    sendEmail: jest.fn(),
  },
}));

const createLoggerMock = (): ILogger => ({
  logger: {} as any,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
});

const baseUser: UserModel = {
  id: 1,
  email: 'test@example.com',
  name: 'Test',
  uniqueLogin: 'tester',
  password: 'hashed',
  photo: null,
  bio: null,
  role: Role.USER,
};

const createService = () => {
  const configValues: Record<string, string> = {
    SALT: '10',
    CONFIRMATION_BASE_URL: 'http://confirm.example.com',
  };

  const configService = {
    get: jest.fn((key: string) => configValues[key]),
  } as unknown as jest.Mocked<IConfigService>;

  const usersRepository: jest.Mocked<IUsersRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findByUniqueLogin: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    deleteById: jest.fn(),
    createEmailConfirmation: jest.fn(),
    updateEmailConfirmationByUserId: jest.fn(),
    updateEmailConfirmation: jest.fn(),
    findIsConfirmed: jest.fn(),
    confirmEmail: jest.fn(),
    confirmTime: jest.fn(),
  };

  const programRepository: jest.Mocked<IProgramRepository> = {
    getProgramsRepository: jest.fn(),
    createProgramRepository: jest.fn(),
    updateProgramRepository: jest.fn(),
    findProgramById: jest.fn(),
    deleteProgramRepository: jest.fn(),
    findProgramWithUserLogin: jest.fn(),
  };

  const logger = createLoggerMock();

  const service = new UserService(configService, usersRepository, programRepository, logger);

  return { service, usersRepository, configService, logger };
};

describe('UserService', () => {
  const emailAdapterMock = emailAdapter as unknown as EmailAdapterMock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('throws HTTPError when email or login already exists', async () => {
      const { service, usersRepository, logger } = createService();
      usersRepository.findByEmail.mockResolvedValue(baseUser);
      usersRepository.findByUniqueLogin.mockResolvedValue(null);

      await expect(
        service.createUser({
          email: baseUser.email,
          name: baseUser.name,
          uniqueLogin: baseUser.uniqueLogin,
          password: 'secret',
          provider: 'LOCAL',
        }),
      ).rejects.toEqual(expect.objectContaining({ statusCode: 409 }));

      expect(logger.warn).toHaveBeenCalled();
      expect(usersRepository.create).not.toHaveBeenCalled();
    });

    it('creates local user, stores confirmation and sends email', async () => {
      const { service, usersRepository } = createService();
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.findByUniqueLogin.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue({
        ...baseUser,
        email: 'new@example.com',
        uniqueLogin: 'newuser',
        name: 'New',
      });
      usersRepository.createEmailConfirmation.mockResolvedValue({} as any);

      const dto: UserDto = {
        email: 'new@example.com',
        name: 'New',
        uniqueLogin: 'newuser',
        password: 'pass123',
        provider: 'LOCAL',
        role: 'USER',
      };

      await service.createUser(dto);

      expect(usersRepository.create).toHaveBeenCalled();
      expect(usersRepository.createEmailConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({ isConfirmed: false }),
      );
      expect(emailAdapterMock.sendEmail).toHaveBeenCalledWith(
        'new@example.com',
        'Confirm your email',
        expect.any(String),
      );
    });

    it('auto-confirms Google users without sending email', async () => {
      const { service, usersRepository } = createService();
      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.findByUniqueLogin.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue({ ...baseUser, id: 5 });
      usersRepository.createEmailConfirmation.mockResolvedValue({} as any);

      await service.createUser({
        email: 'google@example.com',
        name: 'Googler',
        uniqueLogin: 'googler',
        provider: 'GOOGLE',
      });

      expect(usersRepository.createEmailConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({ isConfirmed: true, userId: 5 }),
      );
      expect(emailAdapterMock.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('throws 404 when user not found', async () => {
      const { service, usersRepository } = createService();
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser({ email: 'missing@example.com', password: 'pass' }),
      ).rejects.toEqual(expect.objectContaining({ statusCode: 404 }));
    });

    it('throws 401 when password is invalid', async () => {
      const { service, usersRepository } = createService();
      const hashed = await hash('correct', 10);
      usersRepository.findByEmail.mockResolvedValue({ ...baseUser, password: hashed });

      await expect(
        service.validateUser({ email: baseUser.email, password: 'wrong' }),
      ).rejects.toEqual(expect.objectContaining({ statusCode: 401 }));
    });

    it('throws 401 when email not confirmed', async () => {
      const { service, usersRepository } = createService();
      const hashed = await hash('correct', 10);
      usersRepository.findByEmail.mockResolvedValue({ ...baseUser, password: hashed });
      usersRepository.findIsConfirmed.mockResolvedValue(false);

      await expect(
        service.validateUser({ email: baseUser.email, password: 'correct' }),
      ).rejects.toEqual(expect.objectContaining({ statusCode: 401 }));
    });

    it('returns user when credentials and confirmation are valid', async () => {
      const { service, usersRepository } = createService();
      const hashed = await hash('correct', 10);
      const user = { ...baseUser, password: hashed };
      usersRepository.findByEmail.mockResolvedValue(user);
      usersRepository.findIsConfirmed.mockResolvedValue(true);

      const result = await service.validateUser({ email: user.email, password: 'correct' });

      expect(result).toEqual(user);
    });
  });

  describe('getAllUsers', () => {
    it('throws HTTPError when no users found', async () => {
      const { service, usersRepository } = createService();
      usersRepository.getAll.mockResolvedValue([]);

      await expect(service.getAllUsers()).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 }),
      );
    });

    it('maps returned users to DTOs', async () => {
      const { service, usersRepository } = createService();
      usersRepository.getAll.mockResolvedValue([
        baseUser,
        { ...baseUser, id: 2, email: 'second@example.com', uniqueLogin: 'second' },
      ]);

      const result = await service.getAllUsers();

      expect(result).toEqual([
        expect.objectContaining({ email: baseUser.email, uniqueLogin: baseUser.uniqueLogin }),
        expect.objectContaining({ email: 'second@example.com', uniqueLogin: 'second' }),
      ]);
    });
  });

  describe('getUserById', () => {
    it('returns null and logs warning when user missing', async () => {
      const { service, usersRepository, logger } = createService();
      usersRepository.getById.mockResolvedValue(null);

      const result = await service.getUserById(99);

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalled();
    });

    it('returns DTO when user exists', async () => {
      const { service, usersRepository } = createService();
      usersRepository.getById.mockResolvedValue(baseUser);

      const result = await service.getUserById(baseUser.id);

      expect(result).toMatchObject({ email: baseUser.email, uniqueLogin: baseUser.uniqueLogin });
    });
  });

  describe('deleteUserById', () => {
    it('throws 404 when user does not exist', async () => {
      const { service, usersRepository } = createService();
      usersRepository.getById.mockResolvedValue(null);

      await expect(service.deleteUserById(11)).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 }),
      );
    });

    it('deletes user when found', async () => {
      const { service, usersRepository } = createService();
      usersRepository.getById.mockResolvedValue(baseUser);
      usersRepository.deleteById.mockResolvedValue(baseUser);

      const result = await service.deleteUserById(baseUser.id);

      expect(usersRepository.deleteById).toHaveBeenCalledWith(baseUser.id);
      expect(result).toEqual(baseUser);
    });
  });

  describe('reEmail', () => {
    it('throws 404 when user not registered', async () => {
      const { service, usersRepository } = createService();
      usersRepository.findByEmail.mockResolvedValue(null);

      await expect(service.reEmail('missing@example.com')).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 }),
      );
    });

    it('throws 400 when email already confirmed', async () => {
      const { service, usersRepository } = createService();
      usersRepository.findByEmail.mockResolvedValue(baseUser);
      usersRepository.findIsConfirmed.mockResolvedValue(true);

      await expect(service.reEmail(baseUser.email)).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 }),
      );
    });

    it('sends new confirmation email when not confirmed', async () => {
      const { service, usersRepository } = createService();
      usersRepository.findByEmail.mockResolvedValue(baseUser);
      usersRepository.findIsConfirmed.mockResolvedValue(false);
      usersRepository.updateEmailConfirmationByUserId.mockResolvedValue({} as any);

      const result = await service.reEmail(baseUser.email);

      expect(result).toEqual(baseUser);
      expect(usersRepository.updateEmailConfirmationByUserId).toHaveBeenCalledWith(
        expect.objectContaining({ userId: baseUser.id, isConfirmed: false }),
      );
      expect(emailAdapterMock.sendEmail).toHaveBeenCalled();
    });
  });

  describe('confirmEmail', () => {
    it('throws 404 when confirmation code not found', async () => {
      const { service, usersRepository } = createService();
      usersRepository.confirmEmail.mockResolvedValue(null);

      await expect(service.confirmEmail('bad-code')).rejects.toEqual(
        expect.objectContaining({ statusCode: 404 }),
      );
    });

    it('throws 400 when confirmation code expired', async () => {
      const { service, usersRepository } = createService();
      usersRepository.confirmEmail.mockResolvedValue({ user: baseUser } as any);
      usersRepository.confirmTime.mockResolvedValue(null as any);

      await expect(service.confirmEmail('expired')).rejects.toEqual(
        expect.objectContaining({ statusCode: 400 }),
      );
    });

    it('confirms email and returns user when valid', async () => {
      const { service, usersRepository } = createService();
      usersRepository.confirmEmail.mockResolvedValue({ user: baseUser } as any);
      usersRepository.confirmTime.mockResolvedValue({ user: baseUser } as any);
      usersRepository.updateEmailConfirmation.mockResolvedValue({} as any);

      const result = await service.confirmEmail('good-code');

      expect(usersRepository.updateEmailConfirmation).toHaveBeenCalledWith('good-code');
      expect(result).toEqual(baseUser);
    });
  });
});
