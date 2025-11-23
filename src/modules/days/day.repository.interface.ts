import { WorkoutDayModel } from '@prisma/client';
import { DayDto } from './dto/day.dto';
import { DayEntity } from './entity/day.entity';
import { DayWithExercise } from './types/DayWithExercise';

export interface IDayRepository {
	getDaysByProgramAndUser: (programId: number, userId: number) => Promise<DayWithExercise[]>;
	createDay: (programId: number, dto: DayDto) => Promise<DayWithExercise>;
	updateDay: (entity: DayEntity) => Promise<WorkoutDayModel>;
	getDayByIdAndProgram: (dayId: number, programId: number) => Promise<WorkoutDayModel | null>;
	getDayByIdAndUser: (dayId: number, programId: number, userId: number) => Promise<DayWithExercise | null>;
	deleteDay: (dayId: number) => Promise<void>;
}
