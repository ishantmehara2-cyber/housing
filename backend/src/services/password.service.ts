import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export class PasswordService {
  private static get SaltRounds(): number {
    return env.NODE_ENV === 'test' ? 4 : 12;
  }

  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, PasswordService.SaltRounds);
  }

  public static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
