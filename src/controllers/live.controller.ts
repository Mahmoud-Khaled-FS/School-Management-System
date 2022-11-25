import { randomUUID } from 'crypto';
import { RequestHandler } from 'express';
import Live from '../models/live';
import User, { UserActions } from '../models/user';
import { ErrorRequest } from '../types/reqError';

export const createLive: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.createOrGetUser({ action: UserActions.ID, payload: req.userId });
    const roomId = randomUUID();
    if (!req.body.subject) {
      const err: ErrorRequest = new Error('subject required');
      err.code = 401;
      throw err;
    }
    const live = new Live({
      teacherId: user.id,
      roomId: roomId,
      subject: req.body.subject,
    });
    await live.save();
    const { _id, ...doc } = live.toJSON();
    const response = { id: _id, ...doc };
    res.status(200).json(response);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const getLive: RequestHandler = async (req, res, next) => {
  try {
    const live = await Live.findById(req.params.id);
    if (!live) {
      const err: ErrorRequest = new Error('live not founded');
      err.code = 404;
      throw err;
    }
    const { _id, ...doc } = live.toJSON();
    const response = { id: _id, ...doc };
    res.status(200).json(response);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};
