import mongoose from 'mongoose';
import { ErrorRequest } from '../types/reqError';
import { StudentResponse } from '../types/response';
import { EditMainStudentHealth, EditMainStudentInfo, EditMainStudentParents } from '../types/student';
import { getSchoolLevelData } from '../utils/school-levels';

export enum StudentActions {
  ID = 'ID',
  NEW = 'NEW_USER',
}

export interface IStudent {
  classId: mongoose.Types.ObjectId;
  about?: string;
  yearLevel: number;
  class: string;
  health?: {
    weight?: number;
    height?: number;
    allergicHistory?: string;
    bloodGroup?: string;
  };
  parents?: {
    fatherName?: string;
    fatherEmail?: string;
    fatherPhone?: string;
    motherName?: string;
    motherEmail?: string;
    motherPhone?: string;
    address1?: string;
    address2?: string;
    zip?: number;
  };
  assignments?: {
    assignmentId: mongoose.Types.ObjectId;
    answers: {
      questionId: number;
      answer: string;
    }[];
  }[];
  exams?: {
    examId: mongoose.Types.ObjectId;
    answers: {
      questionId: number;
      answer: string;
    }[];
  }[];
}

export interface StudentDocument extends IStudent, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  _doc?: IStudent;
}

const studentSchema = new mongoose.Schema<IStudent>(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'class',
    },
    about: {
      type: String,
      default: '',
    },
    yearLevel: {
      required: true,
      type: Number,
    },
    class: {
      required: true,
      type: String,
    },
    health: {
      weight: Number,
      height: Number,
      allergicHistory: String,
      bloodGroup: String,
    },
    parents: {
      fatherName: String,
      fatherEmail: String,
      fatherPhone: String,
      motherName: String,
      motherEmail: String,
      motherPhone: String,
      address1: String,
      address2: String,
      zip: Number,
    },
    assignments: {
      type: [
        {
          type: {
            assignmentId: mongoose.Types.ObjectId,
            _id: false,
            answers: [
              {
                questionId: Number,
                answer: String,
                _id: false,
              },
            ],
          },
        },
      ],
    },
    exams: {
      type: [
        {
          type: {
            examId: mongoose.Types.ObjectId,
            _id: false,
            answers: [
              {
                questionId: Number,
                answer: String,
                _id: false,
              },
            ],
          },
        },
      ],
    },
  },
  { timestamps: true },
);

const StudentDoc = mongoose.model<StudentDocument>('student', studentSchema);

class Student {
  private student: StudentDocument;
  private constructor() {}

  static async getOrCreateStduent(student: { action: StudentActions; payload: any }) {
    const obj = new Student();
    switch (student.action) {
      case StudentActions.ID:
        obj.student = await obj.findByID(student.payload);
        break;
      case StudentActions.NEW:
        obj.student = await obj.create(student.payload);
        break;
    }
    return obj;
  }
  private async findByID(id: string) {
    const student = await StudentDoc.findById(id);
    if (!student) {
      throw new Error('student not exist');
    }
    return student;
  }

  private async create(std: IStudent) {
    const student = new StudentDoc({
      class: std.class,
      about: std.about,
      yearLevel: std.yearLevel,
      classId: std.classId,
      health: {
        weight: std.health?.weight,
        height: std.health?.height,
        allergicHistory: std.health?.allergicHistory,
        bloodGroup: std.health?.bloodGroup,
      },
      parents: {
        fatherName: std.parents?.fatherName,
        fatherEmail: std.parents?.fatherEmail,
        fatherPhone: std.parents?.fatherPhone,
        motherName: std.parents?.motherName,
        motherEmail: std.parents?.motherEmail,
        motherPhone: std.parents?.motherPhone,
        address1: std.parents?.address1,
        address2: std.parents?.address2,
        zip: std.parents?.zip,
      },
    });
    await student.save();
    return student;
  }

  get id() {
    return this.student._id!;
  }
  get doc() {
    return this.student._doc!;
  }
  getResponse() {
    const student: StudentResponse = {
      class: this.student.class,
      classId: this.student.classId.toString(),
      yearLevel: getSchoolLevelData(+this.student.yearLevel)!,
      about: this.student.about,
      health: {
        weight: this.student.health?.weight
          ? {
              kg: Number(this.student.health?.weight.toFixed(2)),
              pound: Number((this.student.health?.weight! * 2.20462).toFixed(2)),
            }
          : null,
        height: this.student.health?.height
          ? {
              cm: Number(this.student.health?.height.toFixed(2)),
              inch: Number((this.student.health.height * 0.393701).toFixed(2)),
            }
          : null,
        allergicHistory: this.student.health?.allergicHistory,
        bloodGroup: this.student.health?.bloodGroup,
      },
      parents: {
        father: {
          name: this.student.parents?.fatherName,
          email: this.student.parents?.fatherEmail,
          phone: this.student.parents?.fatherPhone,
        },
        mother: {
          name: this.student.parents?.motherName,
          email: this.student.parents?.motherEmail,
          phone: this.student.parents?.motherPhone,
        },
        adderss: {
          address1: this.student.parents?.address1,
          address2: this.student.parents?.address2,
          zip: this.student.parents?.zip,
        },
      },
    };
    return student;
  }
  async edit(main: EditMainStudentInfo, health: EditMainStudentHealth, parent: EditMainStudentParents) {
    const mainKeys = Object.keys(main);
    if (mainKeys.length !== 0) {
      for (const key of mainKeys) {
        if (!main[key as keyof EditMainStudentInfo]) continue;
        //@ts-ignore
        this.student[key] = main[key as keyof EditMainStudentInfo];
      }
    }
    const hrealthKeys = Object.keys(health);
    if (Object.keys(health).length !== 0) {
      for (const key of hrealthKeys) {
        if (!health[key as keyof EditMainStudentHealth]) continue;
        //@ts-ignore
        this.student.health[key] = health[key as keyof EditMainStudentInfo];
      }
    }
    const parentsKeys = Object.keys(parent);
    if (Object.keys(parent).length !== 0) {
      for (const key of parentsKeys) {
        if (!parent[key as keyof EditMainStudentParents]) continue;
        //@ts-ignore
        this.student.parents[key] = parent[key as keyof EditMainStudentInfo];
      }
    }
    await this.student.save();
    return this.getResponse();
  }

  async delete() {
    await this.student.delete();
  }

  async answerQuestionAssignment(assignmentId: string, answers: { questionId: number; answer: string }[]) {
    if (!this.student.assignments) {
      this.student.assignments = [];
    }
    const assignmentExist = this.student.assignments.find((a) => a.assignmentId.toString() === assignmentId);
    if (assignmentExist) {
      const err: ErrorRequest = new Error('This student answer this assignemnt before');
      err.code = 401;
      throw err;
    }
    this.student.assignments.push({ assignmentId: new mongoose.Types.ObjectId(assignmentId), answers });
    await this.student.save();
  }

  async answerQuestionExam(examId: string, answers: { questionId: number; answer: string }[]) {
    if (!this.student.exams) {
      this.student.exams = [];
    }
    const examExist = this.student.exams.find((a) => a.examId.toString() === examId);
    if (examExist) {
      const err: ErrorRequest = new Error('student answer this exam before');
      err.code = 401;
      throw err;
    }
    this.student.exams.push({ examId: new mongoose.Types.ObjectId(examId), answers });
    await this.student.save();
  }

  // static async includesId(id: string) {
  //   try {
  //     const std = await StudentDoc.findById(id);
  //     if (std) return true;
  //     return false;
  //   } catch {
  //     return false;
  //   }
  // }
}

export default Student;
