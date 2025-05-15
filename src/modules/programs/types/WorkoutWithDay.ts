import { Prisma } from '@prisma/client';

export type WorkoutWithDay = Prisma.WorkoutProgramModelGetPayload<{
	include: {
		workoutDays: true;
		user: {
			select: {
				name: true;
			};
		};
	};
}>;
