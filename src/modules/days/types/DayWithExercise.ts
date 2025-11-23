import { Prisma } from '@prisma/client';

export type DayWithExercise = Prisma.WorkoutDayModelGetPayload<{
  include: {
    exercises: true;
  };
}>;
