export interface UserDto {
  email: string;
  password?: string;
  name: string;
  uniqueLogin: string;
  role?: string;
  photo?: string | null;
  bio?: string | null;
  provider: 'LOCAL' | 'GOOGLE';
}
