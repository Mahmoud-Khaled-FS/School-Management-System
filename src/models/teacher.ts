import mongoose, { Schema } from 'mongoose';
import { TeacherResponse } from '../types/response';
import { EditTeacherBody } from '../types/teacher';

export enum TeacherActions {
  ID = 'ID',
  NEW = 'NEW_USER',
}

export interface ITeacher {
  qualification: string;
  experiance: number;
  classesTaken: mongoose.Types.ObjectId[];
  address: string;
  subject: string;
  bio: string;
}

export interface TeacherDocument extends ITeacher, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  _doc?: ITeacher;
}

const teacherSchema = new Schema<ITeacher>(
  {
    qualification: {
      required: true,
      type: String,
    },
    experiance: {
      required: true,
      type: Number,
    },
    classesTaken: [String],
    address: {
      required: true,
      type: String,
    },
    subject: {
      required: true,
      type: String,
    },
    bio: {
      required: true,
      type: String,
    },
  },
  { timestamps: true },
);

const TeacherDoc = mongoose.model<TeacherDocument>('teacher', teacherSchema);

class Teacher {
  private teacher: TeacherDocument;
  private constructor() {}
  static async getOrCreateTeacher(teacher: { action: TeacherActions; payload: any }) {
    const obj = new Teacher();
    switch (teacher.action) {
      case TeacherActions.ID:
        obj.teacher = await obj.findByID(teacher.payload);
        break;
      case TeacherActions.NEW:
        obj.teacher = await obj.create(teacher.payload);
        break;
    }
    return obj;
  }

  private async findByID(id: string) {
    const student = await TeacherDoc.findById(id);
    if (!student) {
      throw new Error('teatcher not exist');
    }
    return student;
  }

  private async create(tch: ITeacher) {
    const student = new TeacherDoc({
      address: tch.address,
      bio: tch.bio,
      classesTaken: [],
      experiance: tch.experiance,
      qualification: tch.qualification,
      subject: tch.subject,
    });
    await student.save();
    return student;
  }

  get id() {
    return this.teacher._id!;
  }
  get doc() {
    return this.teacher._doc!;
  }
  getResponse() {
    const teacherResponse: TeacherResponse = {
      bio: this.teacher.bio,
      address: this.teacher.address,
      experiance: this.teacher.experiance,
      qualification: this.teacher.qualification,
      subject: this.teacher.subject,
    };
    return teacherResponse;
  }

  async delete() {
    await this.teacher.delete();
  }
  async edit(tch: EditTeacherBody) {
    await this.teacher.updateOne(tch);
    const tchUpdated = await this.teacher.save();
    return tchUpdated;
  }
  async addClassTaken(classId: string) {
    try {
      const isExist = this.teacher.classesTaken.find((id) => id.toString() === classId);
      if (isExist) {
        throw new Error('Class Existing before');
      }
      this.teacher.classesTaken.push(new mongoose.Types.ObjectId(classId));
      await this.teacher.save();
    } catch (err) {
      throw err;
    }
  }
}

export default Teacher;
