import { RequestHandler } from 'express';
import Exam, { ExamFindQuery, IExam } from '../models/exam';
import Student from '../models/student';
import User, { UserActions } from '../models/user';
import { UserRole } from '../types/enums';

export const createExam: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.createOrGetUser({ action: UserActions.ID, payload: req.userId });
    const examData: IExam = {
      questions: req.body.questions,
      teacherCreator: user.id,
      subject: req.body.subject,
      schoolYear: req.body.schoolYear,
      totalScore: req.body.totalScore,
      ...(req.body.forMonth && { forMonth: req.body.forMonth }),
      ...(req.body.info && { info: req.body.info }),
      ...(req.body.type && { type: req.body.type }),
    };
    const exam = await Exam.create(examData);
    res.status(201).json(exam.toJSON());
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const getExams: RequestHandler = async (req, res, next) => {
  try {
    let q: ExamFindQuery;
    if (req.userRole !== UserRole.ADMIN) {
      q = { available: true };
    } else {
      q = {
        ...(req.query.month && { forMonth: +req.query.month }),
        ...(req.query.approved === 'true' && { approved: true }),
        ...(req.query.available === 'true' && { available: true }),
        ...(req.query.subject && { subject: req.query.subject as string }),
        ...(req.query.year && { schoolYear: +req.query.year }),
      };
    }
    const exams = await Exam.getExams(q, req.userRole === UserRole.ADMIN);
    if (!exams) {
      throw new Error('internal server error');
    }

    res.status(200).json(exams);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const getExam: RequestHandler = async (req, res, next) => {
  try {
    const exam = new Exam(req.params.id);
    const response = await exam.getResponse(req.userRole === UserRole.ADMIN);
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

export const answerExam: RequestHandler = async (req, res, next) => {
  try {
    const exam = new Exam(req.params.id);
    const examDoc = await exam.doc();
    const user = await User.createOrGetUser({ action: UserActions.ID, payload: req.userId });
    const student = (await user.getRole()) as Student;
    const correctAnswers = await exam.checkAnswer(req.body.answers);

    await student.answerQuestionExam(examDoc._id, correctAnswers);
    res.status(203).json(correctAnswers);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const approveExam: RequestHandler = async (req, res, next) => {
  try {
    const exam = new Exam(req.params.id);
    if (req.query.reject === 'true') {
      await exam.delete();
    } else {
      await exam.aproveExam();
    }
    res.status(202).send();
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};
export const availableExam: RequestHandler = async (req, res, next) => {
  try {
    const exam = new Exam(req.params.id);
    if (req.query.available === 'true') {
      await exam.availableExam(true);
    } else if (req.query.available === 'false') {
      await exam.availableExam(false);
    }
    res.status(202).send();
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};
