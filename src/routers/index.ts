import { Router } from 'express';
import authRouter from './api/auth.router';
import userRouter from './api/user.router';
import studentRouter from './api/student.router';
import teacherRouter from './api/teacher.router';
import classRouter from './api/class.router';
import assignmentRouter from './api/assignment.router';
import examRouter from './api/exam.router';
import subjectRouter from './api/subject.router';
import streamsRouter from './api/streams.router';
import liveRouter from './api/live.router';
import isAuth from '../middleware/isAuth';
import isAuthQuery from '../middleware/isAuthQuery';

const routers = Router();

routers.use('/auth', authRouter);
routers.use('/user', isAuth, userRouter);
routers.use('/s', isAuth, studentRouter);
routers.use('/t', isAuth, teacherRouter);
routers.use('/class', isAuth, classRouter);
routers.use('/assignment', isAuth, assignmentRouter);
routers.use('/exam', isAuth, examRouter);
routers.use('/subject', isAuth, subjectRouter);
routers.use('/live', isAuth, liveRouter);
routers.use('/stream', isAuthQuery, streamsRouter);

export default routers;
