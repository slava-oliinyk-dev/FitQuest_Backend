import { ExerciseDto } from '../dto/exercise.dto';

export class ExerciseEntity {
  id: number;
  name: string;
  sets: number;
  repetitions: number;
  weight?: number | null;
  restTime?: number | null;
  note?: string | null;
  progressMark?: string | null;
  workoutDayId: number;

  constructor(
    id: number,
    name: string,
    sets: number,
    repetitions: number,
    weight: number | null,
    restTime: number | null,
    note: string | null,
    progressMark: string | null,
    workoutDayId: number,
  ) {
    this.id = id;
    this.name = name;
    this.sets = sets;
    this.repetitions = repetitions;
    this.weight = weight;
    this.restTime = restTime;
    this.note = note;
    this.progressMark = progressMark;
    this.workoutDayId = workoutDayId;
  }

  update(data: Partial<ExerciseDto>) {
    if (data.name !== undefined) this.name = data.name;
    if (data.sets !== undefined) this.sets = data.sets;
    if (data.repetitions !== undefined) this.repetitions = data.repetitions;
    if (data.weight !== undefined) this.weight = data.weight;
    if (data.restTime !== undefined) this.restTime = data.restTime;
    if (data.note !== undefined) this.note = data.note;
    if (data.progressMark !== undefined) this.progressMark = data.progressMark;
  }
}
