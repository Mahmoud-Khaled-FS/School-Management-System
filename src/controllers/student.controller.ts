import { RequestHandler } from 'express';
import { sign } from 'jsonwebtoken';
import User, { UserActions } from '../models/user';
import Student, { IStudent } from '../models/student';
import { UserRole } from '../types/enums';
import { ErrorRequest } from '../types/reqError';
import {
  CreateStudentBody,
  EditMainStudentHealth,
  EditMainStudentInfo,
  EditMainStudentParents,
  EditStudentBody,
} from '../types/student';
import Class from '../models/class';

export const cretaeStudentHandler: RequestHandler = async (req, res, next) => {
  try {
    const body: CreateStudentBody = req.body;
    const userData = {
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      dateOfBirth: new Date(body.dateOfBirth),
      phone: body.phone,
      role: UserRole.STUDENT,
      gender: body.gender,
    };
    const cls = new Class(req.body.classId);
    const clsDoc = await cls.getInfo();
    const studentData: IStudent = {
      classId: clsDoc.id,
      about: body.about,
      class: clsDoc.class,
      yearLevel: clsDoc.year,
      parents: {
        address1: body.address1,
        address2: body.address2,
        fatherEmail: body.fatherEmail,
        fatherName: body.fatherName,
        fatherPhone: body.fatherPhone,
        motherEmail: body.motherEmail,
        motherName: body.motherName,
        motherPhone: body.motherPhone,
        zip: body.zip,
      },
      health: {
        allergicHistory: body.allergicHistory,
        bloodGroup: body.bloodGroup,
        height: body.height,
        weight: body.weight,
      },
    };
    const user = await User.createOrGetUser({ action: UserActions.NEW, payload: userData }, studentData);
    if (!user) {
      const err: ErrorRequest = new Error('Internal server error!');
      err.code = 500;
      return next(err);
    }
    await cls.addStudents([user.id]);
    const token = sign({ id: user.id, role: UserRole.STUDENT }, process.env.TOKEN_KEY!, { expiresIn: '1w' });
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

// Get Student
export const editStudentHandler: RequestHandler = async (req, res, next) => {
  try {
    const body: EditStudentBody = req.body;
    const editMainStudentInfo: EditMainStudentInfo = {
      yearLevel: body.yearLevel,
      about: body.about,
      classNumber: body.classNumber,
    };
    const healthEdit: EditMainStudentHealth = {
      allergicHistory: body.allergicHistory,
      bloodGroup: body.bloodGroup,
      height: body.height,
      weight: body.weight,
    };
    const parentsEdit: EditMainStudentParents = {
      fatherEmail: body.fatherEmail,
      fatherPhone: body.fatherPhone,
      motherEmail: body.motherEmail,
      motherPhone: body.motherPhone,
      address1: body.address1,
      address2: body.address2,
      zip: body.zip,
    };
    const id = req.params.stdId;
    const user = await User.createOrGetUser({ action: UserActions.ID, payload: id });
    if (user.doc.role !== UserRole.STUDENT) {
      const err: ErrorRequest = new Error('User role not student');
      err.code = 400;
      throw err;
    }
    const std = (await user.getRole()) as Student;
    const stdUpdated = await std.edit(editMainStudentInfo, healthEdit, parentsEdit);
    res.status(200).json(stdUpdated);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};
