export class ProgramEntity {
  id: number;
  title: string;
  color: string;
  userId: number; 

  constructor(id: number, title: string, color: string, userId: number) {
    this.id = id;
    this.title = title;
    this.color = color;
    this.userId = userId; 
  }

  update(data: { title: string; color: string }) {
    this.title = data.title;
    this.color = data.color;
  }
}
