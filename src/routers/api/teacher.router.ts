import { Router } from 'express';
import * as controllers from '../../controllers/teacher.controllers';
import Validator from '../../lib/validator';
import roleGuard from '../../middleware/roleGuard';
import validateBody from '../../middleware/validat_body';
import { UserRole } from '../../types/enums';
const router = Router();

router.post(
  '/create',
  roleGuard(UserRole.ADMIN),
  validateBody(Validator.createTeacherBody),
  controllers.createTeacherHandler,
);

router.put(
  '/edit/:id',
  roleGuard(UserRole.ADMIN),
  validateBody(Validator.editTeacherBody),
  controllers.editTeacherHandler,
);

export default router;
