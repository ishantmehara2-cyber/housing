import { apiClient } from './apiClient';
import {
  ApiResponse,
  AuthResponseData,
  LoginInput,
  RegisterInput,
  OtpSendInput,
  OtpVerifyInput,
  PasswordResetRequestInput,
  PasswordResetVerifyInput,
  PasswordResetCompleteInput,
  UserSummary,
} from '@housing-clone/shared';

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponseData> {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', input);
    return res.data.data!;
  },

  async login(input: LoginInput): Promise<AuthResponseData> {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', input);
    return res.data.data!;
  },

  async refreshSession(): Promise<AuthResponseData> {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/refresh');
    return res.data.data!;
  },

  async logout(): Promise<void> {
    await apiClient.post<ApiResponse>('/auth/logout');
  },

  async getCurrentUser(): Promise<UserSummary> {
    const res = await apiClient.get<ApiResponse<UserSummary>>('/users/me');
    return res.data.data!;
  },

  async sendOtp(input: OtpSendInput): Promise<void> {
    await apiClient.post<ApiResponse>('/auth/otp/send', input);
  },

  async verifyOtp(input: OtpVerifyInput): Promise<void> {
    await apiClient.post<ApiResponse>('/auth/otp/verify', input);
  },

  async requestPasswordReset(input: PasswordResetRequestInput): Promise<void> {
    await apiClient.post<ApiResponse>('/auth/password-reset/request', input);
  },

  async verifyPasswordReset(input: PasswordResetVerifyInput): Promise<{ resetToken: string }> {
    const res = await apiClient.post<ApiResponse<{ resetToken: string }>>('/auth/password-reset/verify', input);
    return res.data.data!;
  },

  async completePasswordReset(input: PasswordResetCompleteInput): Promise<void> {
    await apiClient.post<ApiResponse>('/auth/password-reset/complete', input);
  },
};
