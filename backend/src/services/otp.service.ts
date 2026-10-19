import crypto from 'crypto';
import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import { ConsoleOtpProvider, IOtpProvider } from './providers/otp.provider';

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 3;

export class OtpService {
  private static provider: IOtpProvider = new ConsoleOtpProvider();

  public static setProvider(provider: IOtpProvider): void {
    OtpService.provider = provider;
  }

  public static hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  public static async generateAndSendOtp(identifier: string, purpose: string): Promise<{ expiresAt: Date }> {
    // Cryptographically secure 6-digit numeric OTP generation using crypto.randomInt
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = OtpService.hashOtp(rawOtp);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    // Invalidate existing pending OTPs for this identifier + purpose
    await db.otpVerification.deleteMany({
      where: { identifier, purpose },
    });

    // Create new OTP record storing ONLY the SHA-256 hash
    await db.otpVerification.create({
      data: {
        identifier,
        otpHash,
        purpose,
        expiresAt,
        attempts: 0,
      },
    });

    // Send via provider abstraction
    await OtpService.provider.sendOtp(identifier, rawOtp, purpose);

    return { expiresAt };
  }

  public static async verifyOtp(identifier: string, purpose: string, otp: string): Promise<boolean> {
    const record = await db.otpVerification.findFirst({
      where: { identifier, purpose },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new AppError(400, 'Invalid or expired OTP', 'INVALID_OTP');
    }

    if (record.verifiedAt) {
      throw new AppError(400, 'OTP has already been used', 'OTP_ALREADY_USED');
    }

    if (new Date() > record.expiresAt) {
      await db.otpVerification.delete({ where: { id: record.id } }).catch(() => {});
      throw new AppError(400, 'OTP has expired', 'OTP_EXPIRED');
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await db.otpVerification.delete({ where: { id: record.id } }).catch(() => {});
      throw new AppError(429, 'Maximum OTP verification attempts exceeded', 'MAX_OTP_ATTEMPTS');
    }

    const inputHash = OtpService.hashOtp(otp);

    if (inputHash !== record.otpHash) {
      await db.otpVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AppError(400, 'Invalid OTP code', 'INVALID_OTP');
    }

    // Mark verified to prevent reuse
    await db.otpVerification.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    });

    return true;
  }
}
