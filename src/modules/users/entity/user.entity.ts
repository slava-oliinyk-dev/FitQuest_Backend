import { Role } from '@prisma/client';
import { compare, hash } from 'bcryptjs';

export class User {
  private _password: string;
  private _role: Role;

  constructor(
    private readonly _email: string,
    private readonly _name: string,
    private readonly _uniqueLogin: string,
    private readonly _photo: string | null,
    private readonly _bio: string | null,
    role: Role = Role.USER,
    passwordHash?: string,
  ) {
    this._role = role;
    if (passwordHash) {
      this._password = passwordHash;
    }
  }

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get role(): Role {
    return this._role;
  }

  get uniqueLogin(): string {
    return this._uniqueLogin;
  }

  get photo(): string | null {
    return this._photo;
  }

  get bio(): string | null {
    return this._bio;
  }

  get password(): string {
    return this._password;
  }

  public async setPassword(pass: string, salt: number): Promise<void> {
    this._password = await hash(pass, salt);
  }

  public async comparePassword(pass: string): Promise<boolean> {
    return compare(pass, this._password);
  }
}
