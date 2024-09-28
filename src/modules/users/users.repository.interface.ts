import { UserModel } from '@prisma/client';
import { User } from './entity/user.entity';


export interface IUsersRepository {
  create(user: User): Promise<UserModel>;
  findByEmail(email: string): Promise<UserModel | null>;
  findByUniqueLogin(uniqueLogin: string): Promise<UserModel | null>;
  getAll(): Promise<UserModel[]>;
  getById(id: number): Promise<UserModel | null>;
  deleteById(id: number): Promise<UserModel | null>;
}
