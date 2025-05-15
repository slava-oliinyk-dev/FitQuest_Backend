import { WorkoutDayModel } from '@prisma/client';
import { DayDto } from './dto/day.dto';
import { DayEntity } from './entity/day.entity';
import { DayWithExercise } from './types/DayWithExercise';
import { DayWithExercisesDto } from './dto/DayWithExercises.dto';

export interface IDayRepository {
	getDaysRepository: (programId: number, userId: number) => Promise<DayWithExercise[]>;
	createDayRepository: (dto: DayDto, programId: number) => Promise<DayWithExercise>;
	updateDayRepository: (entity: DayEntity) => Promise<WorkoutDayModel>;
	findDayById: (dayId: number, programId: number) => Promise<WorkoutDayModel | null>;
	getDayRepository: (programId: number, dayId: number, userId: number) => Promise<WorkoutDayModel | null>;
	findDayByIdAndUser(dayId: number, userId: number): Promise<WorkoutDayModel | null>;
	deleteDayRepository(dayId: number): Promise<void>;
}
