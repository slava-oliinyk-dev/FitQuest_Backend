import { ProgramService } from './program.service';
import { IProgramRepository } from './program.repository.interface';
import { ILogger } from '../../log/logger.interface';
import { PrismaService } from '../../database/prisma.service';
import { IConfigService } from '../../config/config.service.interface';
import { ProgramDto } from './dto/program.dto';
import { HTTPError } from '../../errors/http-error.class';

const createLoggerMock = (): ILogger => ({
  logger: {} as any,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
});

describe('ProgramService', () => {
  let programRepository: jest.Mocked<IProgramRepository>;
  let service: ProgramService;

  const userId = 4;

  beforeEach(() => {
    programRepository = {
      getProgramsRepository: jest.fn(),
      createProgramRepository: jest.fn(),
      updateProgramRepository: jest.fn(),
      findProgramById: jest.fn(),
      deleteProgramRepository: jest.fn(),
      findProgramWithUserLogin: jest.fn(),
    };

    const logger = createLoggerMock();
    const prismaService = { client: {} } as PrismaService;
    const configService = { get: jest.fn() } as unknown as IConfigService;

    service = new ProgramService(logger, prismaService, configService, programRepository);
  });

  it('formats program list with dates and counts', async () => {
    programRepository.getProgramsRepository.mockResolvedValue([
      {
        id: 1,
        title: 'Hypertrophy',
        creationDate: new Date('2024-04-20T00:00:00Z'),
        workoutDays: [{ id: 1 }, { id: 2 }, { id: 3 }],
        user: { name: 'Alice' },
      } as any,
    ]);

    const result = await service.getProgramsService(userId);

    expect(programRepository.getProgramsRepository).toHaveBeenCalledWith(userId);
    expect(result).toEqual([
      {
        id: 1,
        title: 'Hypertrophy',
        creationDate: '20/04/2024',
        workoutDaysCount: 3,
        userName: 'Alice',
      },
    ]);
  });

  it('creates program and returns mapped dto', async () => {
    const dto: ProgramDto = { title: 'Strength' };
    programRepository.createProgramRepository.mockResolvedValue({
      id: 2,
      title: 'Strength',
      creationDate: new Date('2024-04-10T00:00:00Z'),
      workoutDays: [],
      user: { name: 'Bob' },
    } as any);

    const result = await service.createProgramService(dto, userId);

    expect(programRepository.createProgramRepository).toHaveBeenCalledWith(dto, userId);
    expect(result).toEqual({
      id: 2,
      title: 'Strength',
      creationDate: '10/04/2024',
      workoutDaysCount: 0,
      userName: 'Bob',
    });
  });

  it('throws HTTPError when program not found on update', async () => {
    programRepository.findProgramById.mockResolvedValue(null);

    await expect(service.updateProgramService(99, { title: 'New' }, userId)).rejects.toEqual(
      expect.objectContaining({ statusCode: 404 }),
    );
  });

  it('deletes program after verifying ownership', async () => {
    programRepository.findProgramById.mockResolvedValue({ id: 7 } as any);
    programRepository.deleteProgramRepository.mockResolvedValue({ id: 7 } as any);

    const result = await service.deleteProgramService(7, userId);

    expect(programRepository.findProgramById).toHaveBeenCalledWith(7, userId);
    expect(programRepository.deleteProgramRepository).toHaveBeenCalledWith(7, userId);
    expect(result).toEqual({ id: 7 });
  });

  it('wraps unexpected errors in HTTPError', async () => {
    programRepository.getProgramsRepository.mockRejectedValue(new Error('unexpected'));

    await expect(service.getProgramsService(userId)).rejects.toBeInstanceOf(HTTPError);
  });
});
