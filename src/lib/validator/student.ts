import Joi from 'joi';

export const createStudentValidator = Joi.object({
  about: Joi.string().label('About'),
  classId: Joi.string().required().label('Class Id'),
  weight: Joi.number().max(250).label('Weight'),
  height: Joi.number().max(200).label('Height'),
  allergicHistory: Joi.string().label('Allergic History'),
  bloodGroup: Joi.string().label('Blood Group'),
  fatherName: Joi.string().trim().min(2).max(100).label('Father name'),
  fatherEmail: Joi.string().email().label('Father Email'),
  fatherPhone: Joi.string()
    .trim()
    .pattern(/^[0-9]{2,14}$/, 'numbers')
    .label('Father Phone'),
  motherName: Joi.string().trim().min(2).max(100).label('Mother name'),
  motherEmail: Joi.string().email().label('Mother Email'),
  motherPhone: Joi.string()
    .trim()
    .pattern(/^[0-9]{2,14}$/, 'numbers')
    .label('Mother Phone'),
  address1: Joi.string().label('Adress1'),
  address2: Joi.string().label('Address2'),
  zip: Joi.number().max(9999999).label('ZIP'),
});

export const editStudentValidator = Joi.object({
  fatherEmail: Joi.string().email().label('Father Email'),
  fatherPhone: Joi.string()
    .trim()
    .pattern(/^[0-9]{2,14}$/, 'numbers')
    .label('Father Phone'),
  motherEmail: Joi.string().email().label('Mother Email'),
  motherPhone: Joi.string()
    .trim()
    .pattern(/^[0-9]{2,14}$/, 'numbers')
    .label('Mother Phone'),
  address1: Joi.string().label('Adress1'),
  address2: Joi.string().label('Address2'),
  zip: Joi.number().max(9999999).label('ZIP'),
  about: Joi.string().label('About'),
  classId: Joi.string().label('Class Id'),
  weight: Joi.number().max(250).label('Weight'),
  height: Joi.number().max(200).label('Height'),
  allergicHistory: Joi.string().label('Allergic History'),
});

export const answerQuestionsValidator = Joi.array().required().label('Answers');
