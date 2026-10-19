import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authLimiter, otpLimiter } from '../middlewares/rateLimiter';

export const authRouter = Router();

authRouter.post('/register', authLimiter, AuthController.register);
authRouter.post('/login', authLimiter, AuthController.login);
authRouter.post('/refresh', AuthController.refresh);
authRouter.post('/logout', AuthController.logout);

authRouter.post('/otp/send', otpLimiter, AuthController.sendOtp);
authRouter.post('/otp/verify', otpLimiter, AuthController.verifyOtp);

authRouter.post('/password-reset/request', otpLimiter, AuthController.requestPasswordReset);
authRouter.post('/password-reset/verify', otpLimiter, AuthController.verifyPasswordReset);
authRouter.post('/password-reset/complete', authLimiter, AuthController.completePasswordReset);
