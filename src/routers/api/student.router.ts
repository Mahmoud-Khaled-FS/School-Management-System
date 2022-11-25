import { Router } from 'express';
import * as controllers from '../../controllers/student.controller';
import Validator from '../../lib/validator';
import roleGuard from '../../middleware/roleGuard';
import validateBody from '../../middleware/validat_body';
import { UserRole } from '../../types/enums';
const router = Router();

router.post(
  '/create',
  roleGuard(UserRole.ADMIN),
  validateBody(Validator.createStudentBody),
  controllers.cretaeStudentHandler,
);

router.put(
  '/edit/:stdId',
  roleGuard(UserRole.ADMIN),
  validateBody(Validator.editStudentBody),
  controllers.editStudentHandler,
);

export default router;
