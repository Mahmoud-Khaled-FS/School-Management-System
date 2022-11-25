import { Router } from 'express';
import Validator from '../../lib/validator';
import roleGuard from '../../middleware/roleGuard';
import validateBody from '../../middleware/validat_body';
import { UserRole } from '../../types/enums';
import * as controllers from '../../controllers/assignment.controller';
const router = Router();

router.post(
  '/create',
  roleGuard(UserRole.TEACHER, UserRole.ADMIN),
  validateBody(Validator.assignmentQuestions),
  controllers.createAssignment,
);

router.get('/my-assignment', roleGuard(UserRole.STUDENT), controllers.getMyAssignment);

router.get('/:id', roleGuard(UserRole.TEACHER, UserRole.ADMIN, UserRole.STUDENT), controllers.getAssignment);

router.post(
  '/answer/:id',
  roleGuard(UserRole.STUDENT),
  validateBody(Validator.answerQuestions),
  controllers.answerAssignment,
);

export default router;
