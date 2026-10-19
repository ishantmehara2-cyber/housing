import { User } from '@prisma/client';
import { UserSummary, Role, UserStatus } from '@housing-clone/shared';
import { db } from '../config/db';

export class UserService {
  public static async findById(id: string): Promise<User | null> {
    return db.user.findUnique({ where: { id } });
  }

  public static async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({ where: { email } });
  }

  public static async findByPhone(phone: string): Promise<User | null> {
    return db.user.findUnique({ where: { phone } });
  }

  public static async findByEmailOrPhone(identifier: string): Promise<User | null> {
    const trimmed = identifier.trim();
    const lower = trimmed.toLowerCase();

    return db.user.findFirst({
      where: {
        OR: [
          { email: lower },
          { phone: trimmed },
        ],
      },
    });
  }

  public static toUserSummary(user: User): UserSummary {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role as unknown as Role,
      status: user.status as unknown as UserStatus,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
