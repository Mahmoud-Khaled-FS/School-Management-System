import Joi from 'joi';

export const classValidator = Joi.object({
  year: Joi.number().min(1).max(12).integer().required().label('Year'),
  class: Joi.string().length(1).required().label('Class'),
  name: Joi.string(),
});

export const studentsForClassValidator = Joi.array()
  .items(Joi.string().id().label('Student id'))
  .required()
  .label('Array of students');

export const teacherForClassValidator = Joi.array()
  .items(Joi.string().id().label('teacher id'))
  .required()
  .label('Array of teachers');
