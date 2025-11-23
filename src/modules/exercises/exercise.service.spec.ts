import { ExerciseService } from './exercise.service';
import { IExerciseRepository } from './exercise.repository.interface';
import { IDayRepository } from '../days/day.repository.interface';
import { ILogger } from '../../log/logger.interface';
import { HTTPError } from '../../errors/http-error.class';
import { ExerciseDto } from './dto/exercise.dto';
import { UpdateExerciseNoteDto } from './dto/updateExerciseNote.dto';

const createLoggerMock = (): ILogger => ({
  logger: {} as any,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
});

describe('ExerciseService', () => {
  let exerciseRepository: jest.Mocked<IExerciseRepository>;
  let dayRepository: jest.Mocked<IDayRepository>;
  let service: ExerciseService;

  const userId = 10;
  const dayId = 5;

  beforeEach(() => {
    exerciseRepository = {
      getExercisesByDayAndUser: jest.fn(),
      createExercise: jest.fn(),
      findExerciseByIdAndDay: jest.fn(),
      updateExercise: jest.fn(),
      updateExerciseNote: jest.fn(),
      getExerciseByIdAndUser: jest.fn(),
      deleteExercise: jest.fn(),
    };

    dayRepository = {
      getDaysByProgramAndUser: jest.fn(),
      createDay: jest.fn(),
      findDayByIdAndUser: jest.fn(),
      updateDay: jest.fn(),
      getDayByIdAndProgram: jest.fn(),
      getDayByIdAndUser: jest.fn(),
      deleteDay: jest.fn(),
    };

    service = new ExerciseService(createLoggerMock(), exerciseRepository, dayRepository);
  });

  it('returns mapped exercises for an existing day', async () => {
    dayRepository.findDayByIdAndUser.mockResolvedValue({ id: dayId } as any);
    exerciseRepository.getExercisesByDayAndUser.mockResolvedValue([
      {
        id: 1,
        name: 'Bench Press',
        sets: 3,
        repetitions: 10,
        weight: 100,
        restTime: 60,
        note: 'Start light',
        progressMark: 'A',
      } as any,
    ]);

    const result = await service.getExercisesService(dayId, userId);

    expect(dayRepository.findDayByIdAndUser).toHaveBeenCalledWith(dayId, userId);
    expect(exerciseRepository.getExercisesByDayAndUser).toHaveBeenCalledWith(dayId, userId);
    expect(result).toEqual([
      {
        id: 1,
        name: 'Bench Press',
        sets: 3,
        repetitions: 10,
        weight: 100,
        restTime: 60,
        note: 'Start light',
        progressMark: 'A',
      },
    ]);
  });

  it('throws HTTPError when day is missing in getExercisesService', async () => {
    dayRepository.findDayByIdAndUser.mockResolvedValue(null);

    await expect(service.getExercisesService(dayId, userId)).rejects.toEqual(
      expect.objectContaining({ statusCode: 404 }),
    );
  });

  it('creates a new exercise after validating the day', async () => {
    const dto: ExerciseDto = {
      name: 'Squat',
      sets: 4,
      repetitions: 8,
      weight: 120,
      restTime: 90,
      note: 'Keep back straight',
      progressMark: 'B',
    };

    dayRepository.findDayByIdAndUser.mockResolvedValue({ id: dayId } as any);
    exerciseRepository.createExercise.mockResolvedValue({ id: 7, ...dto } as any);

    const result = await service.createExerciseService(dto, dayId, userId);

    expect(dayRepository.findDayByIdAndUser).toHaveBeenCalledWith(dayId, userId);
    expect(exerciseRepository.createExercise).toHaveBeenCalledWith(dayId, dto);
    expect(result).toEqual({ id: 7, ...dto });
  });

  it('updates exercise note when exercise exists', async () => {
    const exerciseId = 11;
    const noteDto: UpdateExerciseNoteDto = {
      id: exerciseId,
      workoutDayId: dayId,
      note: 'Updated note',
    };

    dayRepository.findDayByIdAndUser.mockResolvedValue({ id: dayId } as any);
    exerciseRepository.findExerciseByIdAndDay.mockResolvedValue({ id: exerciseId } as any);
    exerciseRepository.updateExerciseNote.mockResolvedValue({ ...noteDto } as any);

    const result = await service.updateExerciseNoteService(noteDto, dayId, exerciseId, userId);

    expect(exerciseRepository.findExerciseByIdAndDay).toHaveBeenCalledWith(exerciseId, dayId);
    expect(exerciseRepository.updateExerciseNote).toHaveBeenCalledWith(noteDto);
    expect(result).toEqual(noteDto);
  });

  it('returns false when deleting a non-existent exercise', async () => {
    dayRepository.findDayByIdAndUser.mockResolvedValue({ id: dayId } as any);
    exerciseRepository.findExerciseByIdAndDay.mockResolvedValue(null);

    const result = await service.deleteExerciseService(dayId, 123, userId);

    expect(result).toBe(false);
    expect(exerciseRepository.deleteExercise).not.toHaveBeenCalled();
  });

  it('wraps unexpected errors in HTTPError', async () => {
    dayRepository.findDayByIdAndUser.mockRejectedValue(new Error('db down'));

    await expect(service.getExercisesService(dayId, userId)).rejects.toBeInstanceOf(HTTPError);
  });
});
