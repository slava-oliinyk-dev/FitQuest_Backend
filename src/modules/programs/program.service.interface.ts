import { ProgramDto } from './dto/program.dto';
import { WorkoutProgramModel } from '@prisma/client';

export interface IProgramService {
  getProgramsService(userId: number): Promise<ProgramDto[]>;
  createProgramService(dto: ProgramDto, userId: number): Promise<ProgramDto>;
  updateProgramService(id: number, dto: ProgramDto, userId: number): Promise<ProgramDto>;
  getProgramService(id: number, userId: number): Promise<ProgramDto>;
  deleteProgramService(programId: number, userId: number): Promise<WorkoutProgramModel | null>;
}
