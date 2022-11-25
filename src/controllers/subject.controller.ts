import { RequestHandler } from 'express';
import { createReadStream, statSync } from 'fs';
import path from 'path';
import Subject from '../models/subject';
import User, { UserActions } from '../models/user';
import { UserRole } from '../types/enums';
import { ErrorRequest } from '../types/reqError';
import { Article, Lesson } from '../types/subject';

export const getSubjects: RequestHandler = async (_, res, next) => {
  try {
    const subjects = await Subject.getAll();
    if (!subjects) {
      throw new Error('internal server error');
    }
    res.status(200).json(subjects);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const createSubject: RequestHandler = async (req, res, next) => {
  try {
    if (!req.body.name) {
      const err: ErrorRequest = new Error('invalid name');
      err.code = 400;
      throw err;
    }
    const subjects = await Subject.create(req.body.name);
    if (!subjects) {
      throw new Error('internal server error');
    }
    res.status(201).json(subjects);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const addLesson: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      const err: ErrorRequest = new Error('invalid video');
      err.code = 400;
      throw err;
    }
    const user = await User.createOrGetUser({ action: UserActions.ID, payload: req.userId });
    const lesson: Lesson = {
      author: user.id,
      description: req.body.description,
      thumbnailUrl: 'test',
      title: req.body.title,
      videoUrl: req.file.filename,
    };
    const subject = new Subject(req.params.id);
    const lessonSaved = await subject.addLesson(lesson);
    res.status(201).json(lessonSaved);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const deleteLesson: RequestHandler = async (req, res, next) => {
  try {
    const subjectId = req.params.id;
    const lessonId = req.params.lessonId;
    const subject = new Subject(subjectId);
    if (req.userRole === UserRole.ADMIN) {
      await subject.deleteLesson(lessonId);
    } else {
      const lesson = await subject.getLesson(lessonId);
      if (lesson?.author !== req.userId) {
        const err: ErrorRequest = new Error('not authenticated');
        err.code = 401;
        throw err;
      }
      await subject.deleteLesson(lessonId);
    }
    res.status(204).send();
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const editLesson: RequestHandler = async (req, res, next) => {
  try {
    const subjectId = req.params.id;
    const lessonId = req.params.lessonId;
    interface EditLesson extends Partial<Lesson> {}
    const lessonDataEdit: EditLesson = {
      ...(req.body.title && { title: req.body.title }),
      ...(req.body.description && { description: req.body.description }),
    };
    const subject = new Subject(subjectId);
    if (req.userRole === UserRole.ADMIN) {
      await subject.editLesson(lessonId, lessonDataEdit);
    } else {
      const lesson = await subject.getLesson(lessonId);
      if (lesson?.author !== req.userId) {
        const err: ErrorRequest = new Error('not authenticated');
        err.code = 401;
        throw err;
      }
      await subject.editLesson(lessonId, lessonDataEdit);
    }
    res.status(200).json(lessonDataEdit);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const getLesson: RequestHandler = async (req, res, next) => {
  try {
    const subjectId = req.params.id;
    const lessonId = req.params.lessonId;
    const subject = new Subject(subjectId);
    const lesson = await subject.getLesson(lessonId);
    let user;
    try {
      user = await User.createOrGetUser({ action: UserActions.ID, payload: lesson.author });
    } catch {
      user = null;
    }
    res.status(200).json({ ...lesson, author: user ? user.createUserResponse() : lesson.author });
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};
export const getAllLessons: RequestHandler = async (req, res, next) => {
  try {
    const subjectId = req.params.id;
    const subject = new Subject(subjectId);
    const lessons = await subject.getAllLessons();
    const updatedLessons = [];
    for (const l of lessons) {
      try {
        const user = await User.createOrGetUser({ action: UserActions.ID, payload: l.author });
        updatedLessons.push({ ...l, author: user ? user.createUserResponse() : l.author });
      } catch {
        updatedLessons.push(l);
      }
    }
    res.status(200).json(updatedLessons);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};
export const streamLesson: RequestHandler = async (req, res, next) => {
  try {
    const range = req.headers.range;
    if (!range) {
      return res.status(400).send('Requires Range header');
    }
    // console.log('videoSize');
    const subjectId = req.params.id;
    const lessonId = req.params.lessonId;
    const subject = new Subject(subjectId);
    const lesson = await subject.getLesson(lessonId, true);
    const videoPath = path.join(__dirname, '..', 'uploads', 'lessons', lesson.path!);
    const videoSize = statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, headers);
    const videoStream = createReadStream(videoPath, { start, end });

    videoStream.pipe(res);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    return next(err);
  }
};

export const addTeacher: RequestHandler = async (req, res, next) => {
  try {
    if (!req.body.teacherId) {
      const err: ErrorRequest = new Error('invalid teacherId');
      err.code = 400;
      throw err;
    }
    const user = await User.createOrGetUser({ action: UserActions.ID, payload: req.body.teacherId });
    if (user.doc.role !== UserRole.TEACHER) {
      const err: ErrorRequest = new Error('this user not a teacher');
      err.code = 400;
      throw err;
    }
    const subject = new Subject(req.params.id);
    await subject.addTeacher(user.id);
    res.sendStatus(202);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    return next(err);
  }
};
export const getAllTeachers: RequestHandler = async (req, res, next) => {
  try {
    const subject = new Subject(req.params.id);
    const teachers = await subject.getTeachers();
    res.status(200).json(teachers);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    return next(err);
  }
};

export const addArticle: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.createOrGetUser({ action: UserActions.ID, payload: req.userId });
    const article: Article = {
      author: user.id,
      body: req.body.body,
      title: req.body.title,
    };
    const subject = new Subject(req.params.id);
    const articleSaved = await subject.addArticle(article);
    res.status(201).json(articleSaved);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const deleteArticle: RequestHandler = async (req, res, next) => {
  try {
    const subjectId = req.params.id;
    const articleId = req.params.articleId;
    const subject = new Subject(subjectId);
    if (req.userRole === UserRole.ADMIN) {
      await subject.deleteArticle(articleId);
    } else {
      const article = await subject.getArticle(articleId);
      if (article?.author !== req.userId) {
        const err: ErrorRequest = new Error('not authenticated');
        err.code = 401;
        throw err;
      }
      await subject.deleteArticle(articleId);
    }
    res.status(204).send();
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const editArticle: RequestHandler = async (req, res, next) => {
  try {
    const subjectId = req.params.id;
    const articleId = req.params.articleId;
    interface Editarticle extends Partial<Article> {}
    const articleDataEdit: Editarticle = {
      ...(req.body.title && { title: req.body.title }),
      ...(req.body.body && { description: req.body.body }),
    };
    const subject = new Subject(subjectId);
    if (req.userRole === UserRole.ADMIN) {
      await subject.editArticle(articleId, articleDataEdit);
    } else {
      const article = await subject.getArticle(articleId);
      if (article?.author !== req.userId) {
        const err: ErrorRequest = new Error('not authenticated');
        err.code = 401;
        throw err;
      }
      await subject.editArticle(articleId, articleDataEdit);
    }
    res.status(200).json(articleDataEdit);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};

export const getArticle: RequestHandler = async (req, res, next) => {
  try {
    const subjectId = req.params.id;
    const articleId = req.params.articleId;
    const subject = new Subject(subjectId);
    const article = await subject.getArticle(articleId);
    let user;
    try {
      user = await User.createOrGetUser({ action: UserActions.ID, payload: article.author });
    } catch {
      user = null;
    }
    res.status(200).json({ ...article, author: user ? user.createUserResponse() : article.author });
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};
export const getAllArticles: RequestHandler = async (req, res, next) => {
  try {
    const subjectId = req.params.id;
    const subject = new Subject(subjectId);
    const articles = await subject.getAllArticles();
    const updatedArticles = [];
    for (const l of articles) {
      try {
        const user = await User.createOrGetUser({ action: UserActions.ID, payload: l.author });
        updatedArticles.push({ ...l, author: user ? user.createUserResponse() : l.author });
      } catch {
        updatedArticles.push(l);
      }
    }
    res.status(200).json(updatedArticles);
  } catch (err) {
    if (!err.code) {
      err.code = 500;
    }
    next(err);
  }
};
