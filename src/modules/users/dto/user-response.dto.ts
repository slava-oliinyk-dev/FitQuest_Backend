export class UserResponseDto {
  id!: number;
  email!: string;
  uniqueLogin!: string;
  role!: string;
  photo?: string | null;
  bio?: string | null;

  constructor(model: {
    id: number;
    email: string;
    uniqueLogin: string;
    role: string;
    photo: string | null;
    bio: string | null;
  }) {
    this.id = model.id;
    this.email = model.email;
    this.uniqueLogin = model.uniqueLogin;
    this.role = model.role;
    this.photo = model.photo;
    this.bio = model.bio;
  }
}
