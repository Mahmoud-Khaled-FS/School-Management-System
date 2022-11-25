import { ValidationResult } from 'joi';
import { LoginBody, RegisterBody } from '../../types/auth';
import { CreateClassBody } from '../../types/class';
import { CreateStudentBody, EditStudentBody } from '../../types/student';
import { CreateTeacherBody, EditTeacherBody } from '../../types/teacher';
import { loginValidator, registerValidator } from './auth';
import { classValidator, studentsForClassValidator, teacherForClassValidator } from './class';
import { answerQuestionsValidator, createStudentValidator, editStudentValidator } from './student';
import { articleValidator, lessonValidator } from './subject';
import { createTeacherValidator, editTeacherValidator, examValidator, questionsValidator } from './teacher';

class Validator {
  static registerBody(body: RegisterBody) {
    const validBody: ValidationResult<RegisterBody> = registerValidator.validate(body);
    return validBody;
  }
  static loginBody(body: LoginBody) {
    const validBody: ValidationResult<LoginBody> = loginValidator.validate(body);
    return validBody;
  }
  static createStudentBody(body: CreateStudentBody) {
    const validator = registerValidator.concat(createStudentValidator);
    const validBody = validator.validate(body);
    return validBody;
  }
  static editStudentBody(body: EditStudentBody) {
    const validBody: ValidationResult<EditStudentBody> = editStudentValidator.validate(body);
    return validBody;
  }
  static createTeacherBody(body: CreateTeacherBody) {
    const validator = registerValidator.concat(createTeacherValidator);
    const validBody = validator.validate(body);
    return validBody;
  }
  static editTeacherBody(body: EditStudentBody) {
    const validBody: ValidationResult<EditTeacherBody> = editTeacherValidator.validate(body);
    return validBody;
  }
  static createClassBody(body: CreateClassBody) {
    const validBody: ValidationResult<CreateClassBody> = classValidator.validate(body);
    return validBody;
  }
  static studentsClassBody(body: any) {
    const validBody = studentsForClassValidator.validate(body.students);
    return validBody;
  }
  static teachersClassBody(body: any) {
    const validBody = teacherForClassValidator.validate(body.teachers);
    return validBody;
  }
  static assignmentQuestions(body: any) {
    const validBody = questionsValidator.validate(body.questions);
    return validBody;
  }
  static answerQuestions(body: any) {
    const validBody = answerQuestionsValidator.validate(body.answers);
    return validBody;
  }
  static examBody(body: any) {
    const validBody = examValidator.validate(body);
    return validBody;
  }
  static lessonBody(body: any) {
    const validBody = lessonValidator.validate(body);
    return validBody;
  }
  static articleBody(body: any) {
    const validBody = articleValidator.validate(body);
    return validBody;
  }
}

export default Validator;
