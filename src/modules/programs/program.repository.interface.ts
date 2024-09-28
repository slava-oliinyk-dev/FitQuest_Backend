import { WorkoutProgramModel } from '@prisma/client';
import { ProgramDto } from './dto/program.dto';
import { ProgramEntity } from './entity/program.entity';

export interface IProgramRepository {
  getProgramsRepository(userId: number): Promise<WorkoutProgramModel[]>;
  createProgramRepository(dto: ProgramDto, userId: number): Promise<WorkoutProgramModel>;
  updateProgramRepository(id: number, entity: ProgramEntity): Promise<WorkoutProgramModel>;
  findProgramById(id: number, userId: number): Promise<WorkoutProgramModel | null>;
  deleteProgramRepository(programId: number, userId: number): Promise<WorkoutProgramModel | null>;
}
