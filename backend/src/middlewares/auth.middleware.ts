import { Request, Response, NextFunction } from 'express';
import { Role, UserStatus } from '@housing-clone/shared';
import { JwtService } from '../services/jwt.service';
import { UserService } from '../services/user.service';
import { AppError } from './errorHandler';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication token required', 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    const payload = JwtService.verifyAccessToken(token);

    const user = await UserService.findById(payload.sub);

    if (!user || user.status === (UserStatus.SUSPENDED as string) || user.status === (UserStatus.DELETED as string)) {
      throw new AppError(401, 'User account is invalid or suspended', 'UNAUTHORIZED');
    }

    req.user = {
      id: user.id,
      role: user.role as unknown as Role,
      sessionId: payload.sessionId,
    };

    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = JwtService.verifyAccessToken(token);
      const user = await UserService.findById(payload.sub);
      if (user && user.status === 'ACTIVE') {
        req.user = {
          id: user.id,
          role: user.role as unknown as Role,
          sessionId: payload.sessionId,
        };
      }
    }
  } catch {
    // Ignore invalid token in optional auth
  }
  next();
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'Access denied: Insufficient permissions', 'FORBIDDEN'));
    }

    next();
  };
}

export function requireAnyRole(allowedRoles: Role[]) {
  return requireRole(...allowedRoles);
}
