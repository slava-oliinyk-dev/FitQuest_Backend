import { WorkoutDayModel } from "@prisma/client";
import { DayDto } from "./dto/day.dto";
import { DayEntity } from "./entity/day.entity";


export interface IDayRepository {
	getDaysRepository: (programId: number, userId: number) => Promise<WorkoutDayModel[]>;
    createDayRepository: (dto: DayDto, programId: number) => Promise<WorkoutDayModel>;
    updateDayRepository: (entity: DayEntity) => Promise<WorkoutDayModel>;
    findDayById: (dayId: number, programId: number) => Promise<WorkoutDayModel | null>;
    getDayRepository: (programId: number, dayId: number, userId: number) => Promise<WorkoutDayModel | null>;
    findDayByIdAndUser(dayId: number, userId: number): Promise<WorkoutDayModel | null>;
    deleteDayRepository(dayId: number): Promise<void>;
}
