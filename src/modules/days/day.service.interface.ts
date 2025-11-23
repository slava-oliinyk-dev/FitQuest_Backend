import { DayDto } from './dto/day.dto';
import { DayWithExercisesDto } from './dto/DayWithExercises.dto';

export interface IDayService {
  getDaysService: (programId: number, userId: number) => Promise<DayWithExercisesDto[]>;
  createDayService: (
    programId: number,
    userId: number,
    dto: DayDto,
  ) => Promise<DayWithExercisesDto>;
  updateDayService: (
    programId: number,
    dayId: number,
    userId: number,
    dto: DayDto,
  ) => Promise<DayDto>;
  getDayService: (programId: number, dayId: number, userId: number) => Promise<DayWithExercisesDto>;
  deleteDayService: (programId: number, dayId: number, userId: number) => Promise<void>;
}
