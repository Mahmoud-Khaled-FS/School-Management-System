import { RequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import { ErrorRequest } from '../types/reqError';

const isAuthQuery: RequestHandler = (req, _, next) => {
  const accessToken = req.query.access_token;
  if (!accessToken) {
    const error: ErrorRequest = new Error('not authorized');
    error.code = 401;
    throw error;
  }
  const decodedToken = jwt.verify(accessToken as string, process.env.TOKEN_KEY!) as any;
  if (!decodedToken) {
    const error: ErrorRequest = new Error('Not authenticated');
    error.code = 401;
    throw error;
  }
  req.userId = decodedToken.id;
  req.userRole = decodedToken.role;
  next();
};

export default isAuthQuery;
