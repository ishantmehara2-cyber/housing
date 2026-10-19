export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface SmsMessage {
  toPhone: string;
  body: string;
}

export interface IEmailProvider {
  sendEmail(message: EmailMessage): Promise<boolean>;
}

export interface ISmsProvider {
  sendSms(message: SmsMessage): Promise<boolean>;
}
