export class DayEntity {
	id: number;
	dayName: string;
	muscle: string;
	workoutProgramId: number;

	constructor(id: number, dayName: string, muscle: string, workoutProgramId: number) {
		this.id = id;
		this.dayName = dayName;
		this.muscle = muscle;
		this.workoutProgramId = workoutProgramId;
	}

	update(data: { dayName: string; muscle: string }) {
		this.dayName = data.dayName;
		this.muscle = data.muscle;
	}
}
