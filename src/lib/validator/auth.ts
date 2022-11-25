import Joi from 'joi';
import { GenderEnum } from '../../types/enums';

// validator for register body
export const registerValidator = Joi.object({
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().trim().min(8).max(50).required().label('Password'),
  firstName: Joi.string().trim().min(2).max(55).required().label('First name'),
  lastName: Joi.string().trim().min(2).max(55).required().label('Last name'),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{2,14}$/, 'numbers')
    .required()
    .label('Phone'),
  gender: Joi.string().valid(GenderEnum.MALE, GenderEnum.FEMALE).required().label('Gender'),
  dateOfBirth: Joi.string().isoDate().required().label('Date Of Birth'),
});
// validator for login body
export const loginValidator = Joi.object({
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().trim().min(8).max(50).required().label('Password'),
});
