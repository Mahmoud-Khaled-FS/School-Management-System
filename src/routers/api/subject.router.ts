import { Router } from 'express';
import * as controllers from '../../controllers/subject.controller';
import Validator from '../../lib/validator';
import roleGuard from '../../middleware/roleGuard';
import validateBody from '../../middleware/validat_body';
import upload from '../../middleware/videoUpload';
import { UserRole } from '../../types/enums';
const router = Router();

router.get('/', controllers.getSubjects);

router.post('/add', controllers.createSubject);

// teacher routers
router.post('/:id/teacher', roleGuard(UserRole.ADMIN), controllers.addTeacher);
router.get('/:id/teacher', controllers.getAllTeachers);

// Lessons routers
router.post(
  '/:id/lesson/add',
  roleGuard(UserRole.ADMIN, UserRole.TEACHER),
  upload,
  validateBody(Validator.lessonBody),
  controllers.addLesson,
);
router.get('/:id/lessons', controllers.getAllLessons);
router.get('/:id/lesson/:lessonId', controllers.getLesson);
router.delete('/:id/lesson/:lessonId', roleGuard(UserRole.ADMIN, UserRole.TEACHER), controllers.deleteLesson);
router.put('/:id/lesson/:lessonId', roleGuard(UserRole.ADMIN, UserRole.TEACHER), controllers.editLesson);
// Articles routers
router.post(
  '/:id/article/add',
  roleGuard(UserRole.ADMIN, UserRole.TEACHER),
  validateBody(Validator.articleBody),
  controllers.addArticle,
);
router.get('/:id/articles', controllers.getAllArticles);
router.get('/:id/article/:articleId', controllers.getArticle);
router.delete('/:id/article/:articleId', roleGuard(UserRole.ADMIN, UserRole.TEACHER), controllers.deleteArticle);
router.put('/:id/article/:articleId', roleGuard(UserRole.ADMIN, UserRole.TEACHER), controllers.editArticle);

export default router;
