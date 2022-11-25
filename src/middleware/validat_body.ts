import { RequestHandler } from 'express';
import { ValidationResult } from 'joi';
import { ErrorRequest } from '../types/reqError';

const validateBody = (validator: (body: any) => ValidationResult) => {
  const validateMiddleware: RequestHandler = (req, _, next) => {
    const validateBody = validator(req.body);
    if (validateBody.error) {
      const err: ErrorRequest = new Error(validateBody.error.message);
      err.code = 400;
      return next(err);
    }
    next();
  };
  return validateMiddleware;
};

export default validateBody;
