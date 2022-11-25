import Joi from 'joi';

export const lessonValidator = Joi.object({
  title: Joi.string().required().label('Title'),
  description: Joi.string().required().label('Description'),
});
export const articleValidator = Joi.object({
  title: Joi.string().required().label('Title'),
  body: Joi.string().required().label('Body'),
});
