import { UserModel } from '@prisma/client';
import { UserDto } from './dto/user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginUserDto } from './dto/login-user.dto';

export interface IUserService {
  createUser(dto: UserDto): Promise<UserModel>;
  validateUser(dto: LoginUserDto): Promise<UserModel>;
  getUserInfo(email: string): Promise<UserModel | null>;
  getAllUsers(): Promise<UserResponseDto[]>;
  getUserById(id: number): Promise<UserResponseDto | null>;
  deleteUserById(id: number): Promise<UserModel | null>;
  confirmEmail(code: string): Promise<UserModel | null>;
  reEmail(email: string): Promise<UserModel | null>;
}
