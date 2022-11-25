import { Router } from 'express';
import * as controllers from '../../controllers/class.controllers';
import Validator from '../../lib/validator';
import roleGuard from '../../middleware/roleGuard';
import validateBody from '../../middleware/validat_body';
import { UserRole } from '../../types/enums';
const router = Router();

router.post(
  '/create',
  roleGuard(UserRole.ADMIN),
  validateBody(Validator.createClassBody),
  controllers.createClassHandler,
);

router.get('/', roleGuard(UserRole.ADMIN), controllers.getAllClassesHandler);

router.get('/:id', roleGuard(UserRole.ADMIN), controllers.getClassHandler);

router.delete('/:id', roleGuard(UserRole.ADMIN), controllers.deleteClassHandler);

router.post(
  '/add/student/:id',
  roleGuard(UserRole.ADMIN),
  validateBody(Validator.studentsClassBody),
  controllers.addStudentHandler,
);

router.post(
  '/add/teacher/:id',
  roleGuard(UserRole.ADMIN),
  validateBody(Validator.teachersClassBody),
  controllers.addTeacherHandler,
);

export default router;
