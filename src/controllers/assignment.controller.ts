import { RequestHandler } from 'express';
import Assignment, { IAssignment } from '../models/assignment';
import Class from '../models/class';
import Student from '../models/student';
import User, { UserActions } from '../models/user';
import { ErrorRequest } from '../types/reqError';

export const createAssignment: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.createOrGetUser({ action: UserActions.ID, payload: req.userId });
    if (req.body.classes.length >= 0) {
      for (const id of req.body.classes) {
        const isExist = Class.includesId(id);
        if (!isExist) {
          const err: ErrorRequest = new Error('Invalid Class');
          err.code = 400;
          throw err;
        }
      }
    }
    if (!req.body.subject) {
      const err: ErrorRequest = new Error('Invalid Subject');
      err.code = 400;
      throw err;
    }
    const assignmentData: IAssignment = {
      classes: req.body.classes,
      questions: req.body.questions,
      teacherCreator: user.id,
      subject: req.body.subject,
    };
    const assignment = await Assignment.create(assignmentData);
    res.status(201).json(assignment.toJSON());
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const getAssignment: RequestHandler = async (req, res, next) => {
  try {
    const assignment = new Assignment(req.params.id);
    const response = await assignment.getResponse();
    if (!response) {
      throw new Error('internal server error');
    }
    res.status(200).json(response);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const answerAssignment: RequestHandler = async (req, res, next) => {
  try {
    const assignment = new Assignment(req.params.id);
    const assignmentDoc = await assignment.doc();
    const user = await User.createOrGetUser({ action: UserActions.ID, payload: req.userId });
    const student = (await user.getRole()) as Student;
    const correctAnswers = await assignment.checkAnswer(req.body.answers);

    await student.answerQuestionAssignment(assignmentDoc._id, correctAnswers);
    res.status(203).json(correctAnswers);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const getMyAssignment: RequestHandler = async (req, res, next) => {
  try {
    const assignments = await Assignment.getAssignmentForStudent(req.userId!);
    res.status(200).json(assignments);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};
