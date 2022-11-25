import { RequestHandler } from 'express';
import { ErrorRequest } from '../types/reqError';
import User, { UserActions } from '../models/user';
import * as bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { LoginBody, RegisterBody } from '../types/auth';
import { UserRole } from '../types/enums';

// function for register controller
export const registerHandler: RequestHandler = async (req, res, next) => {
  const body: RegisterBody = req.body;
  try {
    const userData = {
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      dateOfBirth: new Date(body.dateOfBirth),
      phone: body.phone,
      role: UserRole.USER,
      gender: body.gender,
    };
    const user = await User.createOrGetUser({ action: UserActions.NEW, payload: userData });
    if (!user) {
      const err: ErrorRequest = new Error('Internal server error!');
      err.code = 500;
      return next(err);
    }
    const token = sign({ id: user.id, role: user.doc.role }, process.env.TOKEN_KEY!, { expiresIn: '1w' });
    const response = {
      token: token,
      user: user.createUserResponse(),
    };
    return res.status(201).json(response);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

// function for login controller
export const loginHnadler: RequestHandler = async (req, res, next) => {
  try {
    const body: LoginBody = req.body;
    const user = await User.createOrGetUser({ action: UserActions.EMAIL, payload: body.email });
    if (!user) {
      const err: ErrorRequest = new Error('email is not exists');
      err.code = 400;
      return next(err);
    }
    const correctPassword = await bcrypt.compare(body.password, user.doc.password);
    if (!correctPassword) {
      const err: ErrorRequest = new Error('incorrect password');
      err.code = 401;
      return next(err);
    }
    const token = sign({ id: user.id, role: user.doc.role }, process.env.TOKEN_KEY!, { expiresIn: '1w' });
    const response = {
      token: token,
      user: user.createUserResponse(),
    };
    return res.status(200).json(response);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};
