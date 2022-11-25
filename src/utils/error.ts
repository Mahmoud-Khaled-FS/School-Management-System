import { ErrorRequestHandler } from 'express';

const errorRequestHandler: ErrorRequestHandler = (err, _, res, __) => {
  if (err.code) {
    res.status(err.code);
  }

  return res.json({ code: err.code || 400, status: 'failed', message: err.message });
};

export default errorRequestHandler;
