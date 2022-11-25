import { RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import { ErrorRequest } from '../types/reqError';

const isAuth: RequestHandler = (req, _, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error: ErrorRequest = new Error('not authorized');
    error.code = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.TOKEN_KEY!) as any;
  if (!decodedToken) {
    const error: ErrorRequest = new Error('Not authenticated');
    error.code = 401;
    throw error;
  }
  req.userId = decodedToken.id;
  req.userRole = decodedToken.role;
  next();
};

export default isAuth;
