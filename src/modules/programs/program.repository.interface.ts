import { WorkoutProgramModel } from '@prisma/client';
import { ProgramDto } from './dto/program.dto';
import { ProgramEntity } from './entity/program.entity';
import { WorkoutWithDay } from './types/WorkoutWithDay';

export interface IProgramRepository {
  getProgramsRepository(userId: number): Promise<WorkoutWithDay[]>;
  createProgramRepository(dto: ProgramDto, userId: number): Promise<WorkoutWithDay>;
  updateProgramRepository(id: number, entity: ProgramEntity): Promise<WorkoutProgramModel>;
  findProgramById(id: number, userId: number): Promise<WorkoutProgramModel | null>;
  deleteProgramRepository(programId: number, userId: number): Promise<WorkoutProgramModel | null>;
  findProgramWithUserLogin(programId: number, userId: number): Promise<WorkoutProgramModel | null>;
}
