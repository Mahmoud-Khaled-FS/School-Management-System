import { RequestHandler } from 'express';
import { sign } from 'jsonwebtoken';
import Teacher, { ITeacher } from '../models/teacher';
import User, { UserActions } from '../models/user';
import { UserRole } from '../types/enums';
import { ErrorRequest } from '../types/reqError';
import { CreateTeacherBody, EditTeacherBody } from '../types/teacher';

export const createTeacherHandler: RequestHandler = async (req, res, next) => {
  try {
    const body: CreateTeacherBody = req.body;
    const userData = {
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      dateOfBirth: new Date(body.dateOfBirth),
      phone: body.phone,
      role: UserRole.TEACHER,
      gender: body.gender,
    };
    const teacherData: ITeacher = {
      address: body.address,
      bio: body.bio,
      classesTaken: [],
      experiance: body.experiance,
      qualification: body.qualification,
      subject: body.subject,
    };
    const user = await User.createOrGetUser({ action: UserActions.NEW, payload: userData }, teacherData);
    if (!user) {
      const err: ErrorRequest = new Error('Internal server error!');
      err.code = 500;
      return next(err);
    }
    const token = sign({ id: user.id }, process.env.TOKEN_KEY!, { expiresIn: '1w' });
    const response = {
      token: token,
      user: user.createUserResponse(true),
    };
    return res.status(201).json(response);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const editTeacherHandler: RequestHandler = async (req, res, next) => {
  try {
    const body: EditTeacherBody = req.body;
    const editTeacher: EditTeacherBody = {
      address: body.address,
      bio: body.bio,
      experiance: body.experiance,
      qualification: body.qualification,
      subject: body.subject,
    };
    const id = req.params.id;
    const user = await User.createOrGetUser({ action: UserActions.ID, payload: id });
    if (user.doc.role !== UserRole.TEACHER) {
      const err: ErrorRequest = new Error('User role not teacher');
      err.code = 400;
      throw err;
    }
    const tch = (await user.getRole()) as Teacher;
    const tchUpdated = await tch.edit(editTeacher);
    res.status(200).json(tchUpdated);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};
