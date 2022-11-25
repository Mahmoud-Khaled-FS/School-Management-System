import mongoose from 'mongoose';
import { CreateClassBody } from '../types/class';
import { UserRole } from '../types/enums';
import { ErrorRequest } from '../types/reqError';
import Teacher from './teacher';
import User, { UserActions } from './user';

export interface IClass {
  year: number;
  class: string;
  teachers: mongoose.Types.ObjectId[];
  students: mongoose.Types.ObjectId[];
  name?: string;
}

export interface ClassDocument extends IClass, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  _doc?: IClass;
}

const classSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  teachers: {
    type: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    default: [],
    required: true,
  },
  students: {
    type: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    default: [],
    required: true,
  },
  name: String,
});

const ClassDoc = mongoose.model<ClassDocument>('class', classSchema);

class Class {
  private classDoc: ClassDocument | null;
  constructor(private id: string) {}
  static async create(classBody: CreateClassBody) {
    const clsExists = await ClassDoc.findOne({
      year: classBody.year,
      class: classBody.class,
    });
    if (clsExists) {
      const err: ErrorRequest = new Error('Class existing before');
      err.code = 400;
      throw err;
    }
    const cls = new ClassDoc({
      class: classBody.class,
      year: classBody.year,
      name: classBody.name,
    });
    await cls.save();
    return {
      year: cls.year,
      name: cls.name,
      class: cls.class,
      id: cls._id,
    };
  }
  static async getAll() {
    const clses = await ClassDoc.find();
    const clsesUpdated = [];
    for (const cls of clses) {
      clsesUpdated.push({
        year: cls.year,
        name: cls.name,
        class: cls.class,
        id: cls._id,
      });
    }
    return clsesUpdated;
  }

  static async delete(id: string) {
    await ClassDoc.findOneAndDelete({ _id: id });
  }

  static async get(id: string) {
    try {
      const cls = await ClassDoc.findById(id);
      if (!cls) {
        return null;
      }
      const teachers = [];
      if (cls.teachers.length > 0) {
        for (const id of cls.teachers) {
          const user = await User.createOrGetUser({ action: UserActions.ID, payload: id });
          const response = user.createUserResponse(true);
          teachers.push(response);
        }
      }
      const students = [];
      if (cls.students.length > 0) {
        for (const id of cls.students) {
          const user = await User.createOrGetUser({ action: UserActions.ID, payload: id });
          const response = user.createUserResponse(true);
          students.push(response);
        }
      }
      return {
        year: cls.year,
        name: cls.name,
        class: cls.class,
        id: cls._id,
        teachers,
        students,
      };
    } catch {
      return null;
    }
  }

  async getClassDoc() {
    try {
      if (!this.classDoc) {
        const cls = await ClassDoc.findById(this.id);
        this.classDoc = cls;
      }
    } catch {
      const err: ErrorRequest = new Error('class not found');
      err.code = 400;
      throw err;
    }
  }

  async getInfo() {
    await this.getClassDoc();
    return { ...this.classDoc?._doc!, id: this.classDoc?._id };
  }

  async addStudents(studentsId: string[]) {
    try {
      if (!this.classDoc) {
        throw new Error();
      }
      const err = [];
      for (const id of studentsId) {
        const user = await User.createOrGetUser({ action: UserActions.ID, payload: id });
        if (user.doc.role === UserRole.STUDENT) {
          const existId = this.classDoc.students.find((stdId) => stdId.toString() === id);
          if (existId) {
            err.push(`id ${id} is already exsist in class`);
            continue;
          }
          this.classDoc.students.push(new mongoose.Types.ObjectId(id));
        } else {
          err.push(`id ${id} is not student`);
        }
      }
      await this.classDoc.save();
      return err;
    } catch {
      throw new Error('internal server error');
    }
  }
  async addTeachers(teachersId: string[]) {
    try {
      if (!this.classDoc) {
        throw new Error();
      }
      const err = [];
      for (const id of teachersId) {
        const user = await User.createOrGetUser({ action: UserActions.ID, payload: id });
        const teacher = (await user.getRole()) as Teacher;
        if (user.doc.role === UserRole.TEACHER) {
          const existId = this.classDoc.teachers.find((tId) => (tId as mongoose.Types.ObjectId).toString() === id);
          if (existId) {
            err.push(`id ${id} is already exsist in class`);
            continue;
          }
          this.classDoc.teachers.push(new mongoose.Types.ObjectId(id));
          await teacher.addClassTaken(this.id);
        } else {
          err.push(`id ${id} is not teacher`);
        }
      }
      await this.classDoc.save();
      return err;
    } catch (err) {
      throw new Error('internal server error');
    }
  }
  static async includesId(id: string) {
    try {
      const cls = await ClassDoc.findById(id);
      if (cls) return true;
      return false;
    } catch {
      return false;
    }
  }
}

export default Class;
