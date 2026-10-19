import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export interface IOtpProvider {
  sendOtp(identifier: string, otp: string, purpose: string): Promise<boolean>;
}

export class ConsoleOtpProvider implements IOtpProvider {
  public async sendOtp(identifier: string, otp: string, purpose: string): Promise<boolean> {
    if (env.NODE_ENV === 'development') {
      logger.info({ identifier, purpose }, `📱 [DEV OTP PROVIDER] Code for ${identifier} (${purpose}): [ ${otp} ]`);
    }
    // In production or test, no raw OTP is ever logged.
    return true;
  }
}

export class MockSmsOtpProvider implements IOtpProvider {
  public async sendOtp(identifier: string, _otp: string, purpose: string): Promise<boolean> {
    logger.info({ identifier, purpose }, `SMS OTP requested for ${identifier}`);
    return true;
  }
}

export class MockEmailOtpProvider implements IOtpProvider {
  public async sendOtp(identifier: string, _otp: string, purpose: string): Promise<boolean> {
    logger.info({ identifier, purpose }, `Email OTP requested for ${identifier}`);
    return true;
  }
}
