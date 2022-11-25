import { Router } from 'express';
import * as controllers from '../../controllers/live.controller';
import roleGuard from '../../middleware/roleGuard';
import { UserRole } from '../../types/enums';
const router = Router();

router.post('/create', roleGuard(UserRole.TEACHER), controllers.createLive);

router.get('/:id', roleGuard(UserRole.TEACHER, UserRole.ADMIN, UserRole.STUDENT), controllers.getLive);

export default router;
