import { RequestHandler } from 'express';
import { UserRole } from '../types/enums';
import { ErrorRequest } from '../types/reqError';

const roleGuard = (...role: UserRole[]) => {
  const middleware: RequestHandler = (req, _, next) => {
    if (role.includes(req.userRole as UserRole)) {
      return next();
    }
    const err: ErrorRequest = new Error('Unauthorized Error!');
    err.code = 401;
    next(err);
  };
  return middleware;
};

export default roleGuard;
