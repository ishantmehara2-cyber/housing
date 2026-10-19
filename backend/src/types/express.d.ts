import { Role } from '@housing-clone/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        sessionId: string;
      };
    }
  }
}
