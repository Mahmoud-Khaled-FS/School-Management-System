import { RequestHandler } from 'express';
import Class from '../models/class';
import { ErrorRequest } from '../types/reqError';

export const createClassHandler: RequestHandler = async (req, res, next) => {
  try {
    const cls = await Class.create(req.body);
    if (!cls) {
      const err: ErrorRequest = new Error('something wrong');
      err.code = 500;
      throw err;
    }
    res.status(201).json(cls);
  } catch (err) {
    next(err);
  }
};

export const getAllClassesHandler: RequestHandler = async (_, res, next) => {
  try {
    const clses = await Class.getAll();
    res.status(200).json({ classes: clses });
  } catch (err) {
    return next(err);
  }
};

export const getClassHandler: RequestHandler = async (req, res, next) => {
  try {
    const cls = await Class.get(req.params.id);
    if (!cls) {
      const err: ErrorRequest = new Error('The class not found');
      err.code = 404;
      throw err;
    }
    res.status(200).json(cls);
  } catch (err) {
    return next(err);
  }
};

export const deleteClassHandler: RequestHandler = async (req, res, next) => {
  try {
    await Class.delete(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

export const addStudentHandler: RequestHandler = async (req, res, next) => {
  try {
    const studentsId: string[] = req.body.students;
    const classDoc = new Class(req.params.id);
    await classDoc.getClassDoc();
    if (!classDoc) {
      const err: ErrorRequest = new Error('class not found');
      err.code = 404;
      throw err;
    }
    const err = await classDoc.addStudents(studentsId);

    res.status(200).json({ err: err.length === 0 ? null : err });
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const addTeacherHandler: RequestHandler = async (req, res, next) => {
  try {
    const teachersId: string[] = req.body.teachers;
    const classDoc = new Class(req.params.id);
    await classDoc.getClassDoc();
    if (!classDoc) {
      const err: ErrorRequest = new Error('class not found');
      err.code = 404;
      throw err;
    }
    const err = await classDoc.addTeachers(teachersId);

    res.status(200).json({ err: err.length === 0 ? null : err });
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};
