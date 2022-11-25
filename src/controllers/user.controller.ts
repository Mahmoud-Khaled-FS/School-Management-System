import { RequestHandler } from 'express';
import User, { UserActions } from '../models/user';
import { ErrorRequest } from '../types/reqError';

//Get User Profile
export const profileHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.userId) {
      const err: ErrorRequest = new Error('Internal Server Error!');
      err.code = 500;
      throw err;
    }
    const user = await User.createOrGetUser({ action: UserActions.ID, payload: req.userId });
    await user.getRole();
    res.status(200).json(user.createUserResponse(req.query.info === 'full'));
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const deleteUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.stdId;
    const user = await User.createOrGetUser({ action: UserActions.ID, payload: id });
    await user.delete();
    return res.status(204).send();
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    return next(err);
  }
};
