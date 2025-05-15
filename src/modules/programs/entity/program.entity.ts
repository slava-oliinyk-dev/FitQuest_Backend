export class ProgramEntity {
	id: number;
	title: string;
	userId: number;

	constructor(id: number, title: string, userId: number) {
		this.id = id;
		this.title = title;
		this.userId = userId;
	}

	update(data: { title: string }) {
		this.title = data.title;
	}
}
