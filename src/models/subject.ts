import { unlink } from 'fs/promises';
import mongoose from 'mongoose';
import path from 'path';
import { ErrorRequest } from '../types/reqError';
import { Article, Lesson } from '../types/subject';
import User, { UserActions } from './user';

type Id = string | mongoose.Types.ObjectId;

export interface ISubject {
  name: string;
  lessons: mongoose.Types.DocumentArray<Lesson>;
  articles: mongoose.Types.DocumentArray<Article>;
  teachers: Id[];
}

export interface SubjectDocument extends ISubject, mongoose.Document {
  createdAt: string;
  updatedAt: string;
  _doc?: ISubject;
}
interface EditLesson extends Partial<Lesson> {}
interface EditArticle extends Partial<Article> {}
const subjectSchema = new mongoose.Schema<ISubject>(
  {
    lessons: {
      type: [
        {
          title: String,
          description: String,
          thumbnailUrl: String,
          videoUrl: String,
          author: mongoose.Types.ObjectId,
        },
      ],
      default: [],
    },
    articles: {
      type: [
        {
          title: String,
          body: String,
          author: mongoose.Types.ObjectId,
        },
      ],
      default: [],
    },
    name: {
      type: String,
      required: true,
    },
    teachers: {
      type: [mongoose.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: true },
);

const SubjectDoc = mongoose.model<SubjectDocument>('subject', subjectSchema);

class Subject {
  private subject: SubjectDocument | null;
  constructor(private id: string) {}

  static async create(name: string) {
    const subject = new SubjectDoc({ name: name });
    subject.save();
    return { name: subject.name, id: subject._id };
  }

  static async getAll() {
    const subjects = await SubjectDoc.find();
    return subjects.map((s) => ({ name: s.name, id: s._id }));
  }

  async doc() {
    await this.checkIfSubjectExist();
    return { ...this.subject?._doc, _id: this.id };
  }

  private async checkIfSubjectExist() {
    try {
      if (!this.subject) {
        const subject = await SubjectDoc.findById(this.id);
        if (!subject) {
          throw new Error();
        }
        this.subject = subject;
      }
    } catch {
      const err: ErrorRequest = new Error('Subject not found');
      err.code = 404;
      throw err;
    }
  }
  async addLesson(lesson: Lesson) {
    await this.checkIfSubjectExist();
    this.subject?.lessons.push(lesson);
    await this.subject?.save();
    const les = this.subject?.lessons.pop()!;
    return {
      id: les._id,
      title: les.title,
      description: les.description,
      author: les.author,
      thumbnailUrl: les.thumbnailUrl,
    };
  }
  async addArticle(article: Article) {
    await this.checkIfSubjectExist();
    this.subject?.articles.push(article);
    await this.subject?.save();
    const art = this.subject?.articles.pop()!;
    return {
      id: art._id,
      title: art.title,
      body: art.body,
    };
  }

  async getLesson(id: string, path?: boolean) {
    await this.checkIfSubjectExist();
    const lesson = this.subject?.lessons.find((l) => l._id?.toString() === id);
    if (!lesson) {
      const err: ErrorRequest = new Error('lesson not found');
      err.code = 404;
      throw err;
    }
    return {
      id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      author: lesson.author,
      thumbnailUrl: lesson.thumbnailUrl,
      ...(path && { path: lesson.videoUrl }),
    };
  }
  async getArticle(id: string) {
    await this.checkIfSubjectExist();
    const article = this.subject?.articles.find((a) => a._id?.toString() === id);
    if (!article) {
      const err: ErrorRequest = new Error('article not found');
      err.code = 404;
      throw err;
    }
    return {
      id: article._id,
      title: article.title,
      body: article.body,
      author: article.author,
    };
  }

  async getAllLessons() {
    await this.checkIfSubjectExist();
    const lessons = this.subject?.lessons;
    if (!lessons) {
      return [];
    }
    return lessons.map((l) => ({
      id: l._id,
      title: l.title,
      description: l.description,
      author: l.author,
      thumbnailUrl: l.thumbnailUrl,
    }));
  }
  async getAllArticles() {
    await this.checkIfSubjectExist();
    const articles = this.subject?.articles;
    if (!articles) {
      return [];
    }
    return articles.map((a) => ({
      id: a._id,
      title: a.title,
      author: a.author,
      body: a.body,
    }));
  }
  async deleteLesson(id: string) {
    await this.checkIfSubjectExist();
    const lesson = this.subject?.lessons.find((l) => l._id?.toString() === id);
    if (!lesson) {
      const err: ErrorRequest = new Error('Lesson not founded');
      err.code = 404;
      throw err;
    }
    this.subject?.lessons.pull({ _id: lesson?._id });
    await unlink(path.join(__dirname, '..', 'uploads', 'lessons', lesson?.videoUrl!));
    await this.subject?.save();
  }
  async deleteArticle(id: string) {
    try {
      console.log(id);
      await this.checkIfSubjectExist();
      const article = this.subject?.articles.find((a) => a._id?.toString() === id);
      if (!article) {
        const err: ErrorRequest = new Error('article not founded');
        err.code = 404;
        throw err;
      }
      this.subject?.articles.pull({ _id: article?._id });
      await this.subject?.save();
    } catch (err) {
      throw err;
    }
  }
  async editLesson(id: string, data: EditLesson) {
    try {
      await this.checkIfSubjectExist();
      await SubjectDoc.findByIdAndUpdate(
        { _id: this.id },
        {
          $set: {
            ...(data.title && { 'lessons.$[outer].title': data.title }),
            ...(data.description && { 'lessons.$[outer].description': data.description }),
          },
        },
        { arrayFilters: [{ 'outer._id': id }] },
      );
    } catch (err) {
      throw new Error();
    }
  }
  async editArticle(id: string, data: EditArticle) {
    try {
      await this.checkIfSubjectExist();
      await SubjectDoc.findByIdAndUpdate(
        { _id: this.id },
        {
          $set: {
            ...(data.title && { 'articles.$[outer].title': data.title }),
            ...(data.body && { 'articles.$[outer].body': data.body }),
          },
        },
        { arrayFilters: [{ 'outer._id': id }] },
      );
    } catch (err) {
      throw new Error();
    }
  }

  async addTeacher(id: string) {
    try {
      await this.checkIfSubjectExist();
      const t = this.subject?.teachers.find((t) => t.toString() === id.toString());
      if (t) {
        throw new Error();
      }
      this.subject?.teachers.push(id);
      await this.subject?.save();
      return true;
    } catch {
      return false;
    }
  }

  async getTeachers() {
    await this.checkIfSubjectExist();
    const teachers = this.subject?.teachers!;
    const teacherData = [];
    for (const id of teachers) {
      const user = await User.createOrGetUser({ action: UserActions.ID, payload: id });
      teacherData.push(user.createUserResponse());
    }
    return teacherData;
  }
}

export default Subject;
