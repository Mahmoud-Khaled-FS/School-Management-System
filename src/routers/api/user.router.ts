import { Router } from 'express';
import * as controllers from '../../controllers/user.controller';
import roleGuard from '../../middleware/roleGuard';
import { UserRole } from '../../types/enums';
const router = Router();

router.get('/profile', controllers.profileHandler);

router.delete('/delete/:stdId', roleGuard(UserRole.ADMIN), controllers.deleteUserHandler);

export default router;
