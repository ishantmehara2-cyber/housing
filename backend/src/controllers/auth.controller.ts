import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  registerSchema,
  loginSchema,
  otpSendSchema,
  otpVerifySchema,
  passwordResetRequestSchema,
  passwordResetVerifySchema,
  passwordResetCompleteSchema,
  ApiResponse,
  AuthResponseData,
} from '@housing-clone/shared';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp.service';
import { UserService } from '../services/user.service';
import { PasswordService } from '../services/password.service';
import { SessionService } from '../services/session.service';
import { AuditService } from '../services/audit.service';
import { AppError } from '../middlewares/errorHandler';
import { env } from '../config/env';
import { db } from '../config/db';

const REFRESH_COOKIE_NAME = 'housing_refresh_token';

function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth',
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
  });
}

export class AuthController {
  public static async register(req: Request, res: Response<ApiResponse<AuthResponseData>>, next: NextFunction): Promise<void> {
    try {
      const input = registerSchema.parse(req.body);
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.register(input, ipAddress, userAgent);

      setRefreshCookie(res, result.tokens.refreshToken);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: {
          accessToken: result.tokens.accessToken,
          user: result.user,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async login(req: Request, res: Response<ApiResponse<AuthResponseData>>, next: NextFunction): Promise<void> {
    try {
      const input = loginSchema.parse(req.body);
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.login(input, ipAddress, userAgent);

      setRefreshCookie(res, result.tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: result.tokens.accessToken,
          user: result.user,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async refresh(req: Request, res: Response<ApiResponse<AuthResponseData>>, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

      if (!refreshToken) {
        throw new AppError(401, 'Refresh token cookie required', 'NO_REFRESH_COOKIE');
      }

      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.refresh(refreshToken, ipAddress, userAgent);

      setRefreshCookie(res, result.tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Session refreshed successfully',
        data: {
          accessToken: result.tokens.accessToken,
          user: result.user,
        },
      });
    } catch (err) {
      clearRefreshCookie(res);
      next(err);
    }
  }

  public static async logout(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

      await AuthService.logout(userId, refreshToken, req.ip);
      clearRefreshCookie(res);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (err) {
      clearRefreshCookie(res);
      next(err);
    }
  }

  public static async sendOtp(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const input = otpSendSchema.parse(req.body);

      await OtpService.generateAndSendOtp(input.identifier, input.purpose);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  public static async verifyOtp(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const input = otpVerifySchema.parse(req.body);

      await OtpService.verifyOtp(input.identifier, input.purpose, input.otp);

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  public static async requestPasswordReset(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const input = passwordResetRequestSchema.parse(req.body);
      const user = await UserService.findByEmailOrPhone(input.identifier);

      // Always return 200 OK without leaking whether account exists
      if (user) {
        await OtpService.generateAndSendOtp(input.identifier, 'PASSWORD_RESET');
      }

      res.status(200).json({
        success: true,
        message: 'If an account exists, a password reset OTP has been sent.',
      });
    } catch (err) {
      next(err);
    }
  }

  public static async verifyPasswordReset(req: Request, res: Response<ApiResponse<{ resetToken: string }>>, next: NextFunction): Promise<void> {
    try {
      const input = passwordResetVerifySchema.parse(req.body);

      await OtpService.verifyOtp(input.identifier, 'PASSWORD_RESET', input.otp);

      // Generate a temporary reset token (valid for 15 minutes)
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Store in userSession or otpVerification metadata
      await db.otpVerification.create({
        data: {
          identifier: input.identifier,
          otpHash: resetTokenHash,
          purpose: 'PASSWORD_RESET_TOKEN',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      res.status(200).json({
        success: true,
        message: 'OTP verified. Use reset token to complete password reset.',
        data: { resetToken },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async completePasswordReset(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const input = passwordResetCompleteSchema.parse(req.body);
      const resetTokenHash = crypto.createHash('sha256').update(input.resetToken).digest('hex');

      const resetRecord = await db.otpVerification.findFirst({
        where: { identifier: input.identifier, purpose: 'PASSWORD_RESET_TOKEN', otpHash: resetTokenHash },
      });

      if (!resetRecord || new Date() > resetRecord.expiresAt) {
        throw new AppError(400, 'Invalid or expired reset token', 'INVALID_RESET_TOKEN');
      }

      const user = await UserService.findByEmailOrPhone(input.identifier);

      if (!user) {
        throw new AppError(404, 'User account not found', 'USER_NOT_FOUND');
      }

      const newPasswordHash = await PasswordService.hashPassword(input.newPassword);

      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      });

      // Cleanup reset token & revoke existing sessions
      await db.otpVerification.delete({ where: { id: resetRecord.id } }).catch(() => {});
      await SessionService.revokeAllUserSessions(user.id);

      await AuditService.log(user.id, 'PASSWORD_RESET_COMPLETED', 'User', user.id, {}, req.ip);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully. Please log in with your new password.',
      });
    } catch (err) {
      next(err);
    }
  }
}
