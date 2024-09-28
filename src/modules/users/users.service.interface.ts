import { UserModel } from '@prisma/client';
import { UserDto } from './dto/user.dto';

export interface IUserService {
  createUser(dto: UserDto): Promise<UserModel | null>;
  validateUser(dto: UserDto): Promise<UserModel | null>;
  getUserInfo(email: string): Promise<UserModel | null>;
  getAllUsers(): Promise<UserModel[]>;
  getUserById(id: number): Promise<UserModel | null>;
  deleteUserById(id: number): Promise<UserModel | null>;
}
