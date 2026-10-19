import { IEmailProvider, ISmsProvider, EmailMessage, SmsMessage } from './notification.types';
import { logger } from '../../utils/logger';

export class DevEmailProvider implements IEmailProvider {
  public async sendEmail(message: EmailMessage): Promise<boolean> {
    logger.info({ to: message.to, subject: message.subject }, 'DEV_EMAIL_SENT: Simulated email dispatch');
    return true;
  }
}

export class DevSmsProvider implements ISmsProvider {
  public async sendSms(message: SmsMessage): Promise<boolean> {
    logger.info({ toPhone: message.toPhone }, 'DEV_SMS_SENT: Simulated SMS dispatch');
    return true;
  }
}
