import { Router } from 'express';
import * as controllersSubject from '../../controllers/subject.controller';
const router = Router();

router.get('/:id/lesson/:lessonId', controllersSubject.streamLesson);

export default router;
