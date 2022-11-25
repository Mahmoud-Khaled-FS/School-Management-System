import { Router } from 'express';
import validateBody from '../../middleware/validat_body';
import * as controllers from '../../controllers/auth.controller';
import Validator from '../../lib/validator';

const routers = Router();

routers.post('/register', validateBody(Validator.registerBody), controllers.registerHandler);

routers.post('/login', validateBody(Validator.loginBody), controllers.loginHnadler);

routers.get('reset-password');

routers.post('confirm-reset-password');

export default routers;
