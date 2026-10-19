import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { Role } from '@housing-clone/shared';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler';

export interface JwtAccessTokenPayload {
  sub: string; // User ID
  role: Role;
  sessionId: string;
  type: 'access';
  iat?: number;
  exp?: number;
}

export class JwtService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes

  public static generateAccessToken(userId: string, role: Role, sessionId: string): string {
    const payload: JwtAccessTokenPayload = {
      sub: userId,
      role,
      sessionId,
      type: 'access',
    };

    const options: SignOptions = {
      algorithm: 'HS256',
      expiresIn: JwtService.ACCESS_TOKEN_EXPIRY,
      issuer: 'housing-clone-api',
      audience: 'housing-clone-client',
    };

    return jwt.sign(payload, env.JWT_SECRET, options);
  }

  public static verifyAccessToken(token: string): JwtAccessTokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'housing-clone-api',
        audience: 'housing-clone-client',
      }) as JwtAccessTokenPayload;

      if (decoded.type !== 'access') {
        throw new AppError(401, 'Invalid token type', 'INVALID_TOKEN');
      }

      return decoded;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError(401, 'Access token has expired', 'TOKEN_EXPIRED');
      }
      throw new AppError(401, 'Invalid access token', 'INVALID_TOKEN');
    }
  }

  public static generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  public static hashRefreshToken(token: string): string {
    return crypto.createHmac('sha256', env.JWT_REFRESH_SECRET).update(token).digest('hex');
  }
}
