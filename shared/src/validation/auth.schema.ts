import { z } from 'zod';
import { Role } from '../enums';

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase().optional().or(z.literal('')),
  phone: z.string().trim().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.nativeEnum(Role).optional(), // Ignored or restricted during normal registration
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone number is required',
  path: ['email'],
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

export const otpPurposeSchema = z.enum([
  'REGISTER',
  'LOGIN',
  'PASSWORD_RESET',
  'EMAIL_VERIFY',
  'PHONE_VERIFY',
]);

export const otpSendSchema = z.object({
  identifier: z.string().trim().min(3, 'Email or phone number is required'),
  purpose: otpPurposeSchema,
});

export const otpVerifySchema = z.object({
  identifier: z.string().trim().min(3, 'Email or phone number is required'),
  otp: z.string().trim().length(6, 'OTP must be 6 digits'),
  purpose: otpPurposeSchema,
});

export const passwordResetRequestSchema = z.object({
  identifier: z.string().trim().min(3, 'Email or phone number is required'),
});

export const passwordResetVerifySchema = z.object({
  identifier: z.string().trim().min(3, 'Email or phone number is required'),
  otp: z.string().trim().length(6, 'OTP must be 6 digits'),
});

export const passwordResetCompleteSchema = z.object({
  identifier: z.string().trim().min(3, 'Email or phone number is required'),
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpSendInput = z.infer<typeof otpSendSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetVerifyInput = z.infer<typeof passwordResetVerifySchema>;
export type PasswordResetCompleteInput = z.infer<typeof passwordResetCompleteSchema>;
