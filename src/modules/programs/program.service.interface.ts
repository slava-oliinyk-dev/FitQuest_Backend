import { ProgramDto } from './dto/program.dto';
import { WorkoutProgramModel } from '@prisma/client';
import { ProgramWithDaysDto } from './dto/ProgramWithDays.dto';

export interface IProgramService {
  getProgramsService(userId: number): Promise<ProgramWithDaysDto[]>;
  createProgramService(dto: ProgramDto, userId: number): Promise<ProgramWithDaysDto>;
  updateProgramService(id: number, dto: ProgramDto, userId: number): Promise<ProgramDto>;
  getProgramService(id: number, userId: number): Promise<ProgramDto>;
  deleteProgramService(programId: number, userId: number): Promise<WorkoutProgramModel | null>;
}
