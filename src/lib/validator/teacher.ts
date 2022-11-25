import Joi from 'joi';
import { QuestionTypes } from '../../types/enums';

let questionTypesArray = [
  QuestionTypes.CHOICE,
  QuestionTypes.COMPLET,
  QuestionTypes.ESSAYS,
  QuestionTypes.SHORT,
  QuestionTypes.TRUE_FALSE,
];

export const createTeacherValidator = Joi.object({
  qualification: Joi.string().required().label('Qualification'),
  experiance: Joi.number().min(0).max(50).required().label('Experiance'),
  address: Joi.string().required().label('Address'),
  subject: Joi.string().required().label('Subject'),
  bio: Joi.string().required().label('Bio'),
});
export const editTeacherValidator = Joi.object({
  qualification: Joi.string().label('Qualification'),
  experiance: Joi.number().min(0).max(50).label('Experiance'),
  address: Joi.string().label('Address'),
  subject: Joi.string().label('Subject'),
  bio: Joi.string().label('Bio'),
});

export const questionValidator = Joi.object({
  question: Joi.string().required().label('Question'),
  type: Joi.string()
    .valid(...questionTypesArray)
    .required()
    .label('Type'),
  answers: Joi.array().items(Joi.string().label('Answer')),
});
export const questionsValidator = Joi.array().items(questionValidator).required().label('Questions');

export const examValidator = Joi.object({
  subject: Joi.string().required().label('Subject'),
  schoolYear: Joi.number().integer().min(1).max(12).required().label('School Year'),
  totalScore: Joi.number().integer().required().label('Total Score'),
  forMonth: Joi.number().integer().label('For Mounth'),
  info: Joi.string().label('Info'),
  type: Joi.string().label('Type'),
  questions: questionsValidator,
});
