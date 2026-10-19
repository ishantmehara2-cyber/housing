import { Role, UserStatus, RegisterInput, LoginInput, UserSummary } from '@housing-clone/shared';
import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { PasswordService } from './password.service';
import { JwtService } from './jwt.service';
import { SessionService } from './session.service';
import { UserService } from './user.service';
import { AuditService } from './audit.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  tokens: AuthTokens;
  user: UserSummary;
}

export class AuthService {
  public static async register(
    input: RegisterInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    const email = input.email ? input.email.trim().toLowerCase() : null;
    const phone = input.phone ? input.phone.trim() : null;

    if (email) {
      const existingEmail = await UserService.findByEmail(email);
      if (existingEmail) {
        throw new AppError(409, 'An account with this email already exists', 'EMAIL_EXISTS');
      }
    }

    if (phone) {
      const existingPhone = await UserService.findByPhone(phone);
      if (existingPhone) {
        throw new AppError(409, 'An account with this phone number already exists', 'PHONE_EXISTS');
      }
    }

    // Role elevation security: Normal registration defaults strictly to TENANT_BUYER
    const role: Role = Role.TENANT_BUYER;

    const passwordHash = await PasswordService.hashPassword(input.password);

    const user = await db.user.create({
      data: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email,
        phone,
        passwordHash,
        role: role as unknown as import('@prisma/client').Role,
        status: UserStatus.ACTIVE as unknown as import('@prisma/client').UserStatus,
      },
    });

    const refreshToken = JwtService.generateRefreshToken();
    const tokenHash = JwtService.hashRefreshToken(refreshToken);

    const session = await SessionService.createSession(user.id, tokenHash, ipAddress, userAgent);
    const accessToken = JwtService.generateAccessToken(user.id, user.role as unknown as Role, session.id);

    await AuditService.log(user.id, 'USER_REGISTERED', 'User', user.id, { role }, ipAddress);

    return {
      tokens: { accessToken, refreshToken },
      user: UserService.toUserSummary(user),
    };
  }

  public static async login(
    input: LoginInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    const user = await UserService.findByEmailOrPhone(input.identifier);

    if (!user || !user.passwordHash) {
      throw new AppError(401, 'Invalid login credentials', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await PasswordService.verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      await AuditService.log(user.id, 'LOGIN_FAILED', 'User', user.id, { reason: 'Wrong password' }, ipAddress);
      throw new AppError(401, 'Invalid login credentials', 'INVALID_CREDENTIALS');
    }

    if (user.status === (UserStatus.SUSPENDED as string) || user.status === (UserStatus.DELETED as string)) {
      throw new AppError(403, 'Your account has been suspended or deactivated', 'ACCOUNT_SUSPENDED');
    }

    const refreshToken = JwtService.generateRefreshToken();
    const tokenHash = JwtService.hashRefreshToken(refreshToken);

    const session = await SessionService.createSession(user.id, tokenHash, ipAddress, userAgent);
    const accessToken = JwtService.generateAccessToken(user.id, user.role as unknown as Role, session.id);

    await AuditService.log(user.id, 'USER_LOGIN', 'User', user.id, {}, ipAddress);

    return {
      tokens: { accessToken, refreshToken },
      user: UserService.toUserSummary(user),
    };
  }

  public static async refresh(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    const tokenHash = JwtService.hashRefreshToken(refreshToken);

    const session = await db.userSession.findFirst({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || new Date() > session.expiresAt) {
      throw new AppError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const user = session.user;

    if (user.status === (UserStatus.SUSPENDED as string) || user.status === (UserStatus.DELETED as string)) {
      await SessionService.revokeSession(session.id);
      throw new AppError(403, 'Account is suspended', 'ACCOUNT_SUSPENDED');
    }

    // Token Rotation
    const newRefreshToken = JwtService.generateRefreshToken();
    const newTokenHash = JwtService.hashRefreshToken(newRefreshToken);

    const updatedSession = await SessionService.updateSessionHash(session.id, newTokenHash, ipAddress, userAgent);
    const newAccessToken = JwtService.generateAccessToken(user.id, user.role as unknown as Role, updatedSession.id);

    return {
      tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      user: UserService.toUserSummary(user),
    };
  }

  public static async logout(userId?: string, refreshToken?: string, ipAddress?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = JwtService.hashRefreshToken(refreshToken);
      const session = await db.userSession.findFirst({ where: { tokenHash } });
      if (session) {
        await SessionService.revokeSession(session.id);
        if (!userId) {
          userId = session.userId;
        }
      }
    } else if (userId) {
      await SessionService.revokeAllUserSessions(userId);
    }

    if (userId) {
      await AuditService.log(userId, 'USER_LOGOUT', 'User', userId, {}, ipAddress);
    }
  }
}
