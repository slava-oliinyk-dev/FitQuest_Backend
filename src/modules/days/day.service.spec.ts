import { DayService } from './day.service';
import { IDayRepository } from './day.repository.interface';
import { IProgramRepository } from '../programs/program.repository.interface';
import { ILogger } from '../../log/logger.interface';
import { HTTPError } from '../../errors/http-error.class';
import { DayDto } from './dto/day.dto';

const createLoggerMock = (): ILogger => ({
  logger: {} as any,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
});

describe('DayService', () => {
  let dayRepository: jest.Mocked<IDayRepository>;
  let programRepository: jest.Mocked<IProgramRepository>;
  let service: DayService;

  const programId = 3;
  const userId = 9;

  beforeEach(() => {
    dayRepository = {
      getDaysByProgramAndUser: jest.fn(),
      createDay: jest.fn(),
      findDayByIdAndUser: jest.fn(),
      updateDay: jest.fn(),
      getDayByIdAndProgram: jest.fn(),
      getDayByIdAndUser: jest.fn(),
      deleteDay: jest.fn(),
    };

    programRepository = {
      getProgramsRepository: jest.fn(),
      createProgramRepository: jest.fn(),
      updateProgramRepository: jest.fn(),
      findProgramById: jest.fn(),
      deleteProgramRepository: jest.fn(),
      findProgramWithUserLogin: jest.fn(),
    };

    service = new DayService(createLoggerMock(), dayRepository, programRepository);
  });

  it('maps returned days with exercise count', async () => {
    programRepository.findProgramById.mockResolvedValue({ id: programId } as any);
    dayRepository.getDaysByProgramAndUser.mockResolvedValue([
      {
        id: 1,
        dayName: 'Push',
        muscle: 'Chest',
        creationDate: new Date('2024-05-10T00:00:00Z'),
        exercises: [{ id: 1 }, { id: 2 }],
      } as any,
    ]);

    const result = await service.getDaysService(programId, userId);

    expect(programRepository.findProgramById).toHaveBeenCalledWith(programId, userId);
    expect(dayRepository.getDaysByProgramAndUser).toHaveBeenCalledWith(programId, userId);
    expect(result).toEqual([
      {
        id: 1,
        dayName: 'Push',
        muscle: 'Chest',
        creationDate: '2024-05-10T00:00:00.000Z',
        workoutExercisesCount: 2,
      },
    ]);
  });

  it('creates a day when program exists', async () => {
    const dto: DayDto = { dayName: 'Legs', muscle: 'Quads' };
    programRepository.findProgramById.mockResolvedValue({ id: programId } as any);
    dayRepository.createDay.mockResolvedValue({
      id: 12,
      ...dto,
      creationDate: new Date('2024-05-01T00:00:00Z'),
      exercises: [],
    } as any);

    const result = await service.createDayService(programId, userId, dto);

    expect(dayRepository.createDay).toHaveBeenCalledWith(programId, dto);
    expect(result).toMatchObject({
      id: 12,
      dayName: 'Legs',
      muscle: 'Quads',
      workoutExercisesCount: 0,
    });
  });

  it('throws when program is missing on update', async () => {
    programRepository.findProgramById.mockResolvedValue(null);

    await expect(
      service.updateDayService(programId, 1, userId, { dayName: 'x', muscle: 'y' }),
    ).rejects.toEqual(expect.objectContaining({ statusCode: 404 }));
  });

  it('throws when day is missing on delete', async () => {
    programRepository.findProgramById.mockResolvedValue({ id: programId } as any);
    dayRepository.getDayByIdAndProgram.mockResolvedValue(null);

    await expect(service.deleteDayService(programId, 55, userId)).rejects.toBeInstanceOf(HTTPError);
  });
});
