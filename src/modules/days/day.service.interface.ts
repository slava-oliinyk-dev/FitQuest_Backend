import { WorkoutDayModel } from '@prisma/client';
import { DayDto } from './dto/day.dto';
import { DayWithExercisesDto } from './dto/DayWithExercises.dto';

export interface IDayService {
	getDaysService: (programId: number, userId: number) => Promise<DayWithExercisesDto[]>;
	createDayService: (dto: DayWithExercisesDto, userId: number, programId: number) => Promise<DayDto>;
	updateDayService: (dto: DayDto, programId: number, dayId: number, userId: number) => Promise<DayDto>;
	getDayService: (programId: number, dayId: number, userId: number) => Promise<WorkoutDayModel>;
	deleteDayService: (programId: number, dayId: number, userId: number) => Promise<void>;
}
