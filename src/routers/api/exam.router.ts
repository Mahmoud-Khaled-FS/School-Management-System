import { Router } from 'express';
import Validator from '../../lib/validator';
import roleGuard from '../../middleware/roleGuard';
import validateBody from '../../middleware/validat_body';
import { UserRole } from '../../types/enums';
import * as controllers from '../../controllers/exam.controller';
const router = Router();

router.post(
  '/create',
  roleGuard(UserRole.TEACHER, UserRole.ADMIN),
  validateBody(Validator.examBody),
  controllers.createExam,
);

router.get('/search', roleGuard(UserRole.TEACHER, UserRole.ADMIN, UserRole.STUDENT), controllers.getExams);

router.get('/:id', roleGuard(UserRole.TEACHER, UserRole.ADMIN, UserRole.STUDENT), controllers.getExam);

router.post(
  '/answer/:id',
  roleGuard(UserRole.STUDENT),
  validateBody(Validator.answerQuestions),
  controllers.answerExam,
);

router.patch('/admin/approve/:id', roleGuard(UserRole.ADMIN), controllers.approveExam);

router.patch('/admin/available/:id', roleGuard(UserRole.ADMIN), controllers.availableExam);

export default router;
