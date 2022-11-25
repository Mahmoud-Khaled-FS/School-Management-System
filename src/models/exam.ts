import mongoose from 'mongoose';
import { ErrorRequest } from '../types/reqError';
import { ExamResponse } from '../types/response';
import { Answer, Question } from '../types/teacher';
import User, { UserActions } from './user';

export interface IExam {
  teacherCreator: mongoose.Types.ObjectId;
  subject: string;
  questions: Question[];
  schoolYear: number;
  totalScore: number;
  type?: string;
  info?: string;
  forMonth?: number;
  approved?: boolean;
  available?: boolean;
}

export interface ExamDocument extends IExam, mongoose.Document {
  createdAt: string;
  updatedAt: string;
  _doc?: IExam;
}

const examSchema = new mongoose.Schema<IExam>(
  {
    teacherCreator: mongoose.Types.ObjectId,
    subject: String,
    approved: {
      type: Boolean,
      default: false,
    },
    forMonth: Number,
    info: String,
    schoolYear: {
      required: true,
      type: Number,
    },
    totalScore: {
      type: Number,
      required: true,
    },
    type: String,
    questions: [
      {
        type: { type: String },
        question: String,
        answers: [String],
        id: Number,
        _id: false,
      },
    ],
    available: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const ExamDoc = mongoose.model<ExamDocument>('exam', examSchema);

export interface ExamFindQuery {
  forMonth?: number;
  approved?: boolean;
  available?: boolean;
  subject?: string;
  schoolYear?: number;
}

class Exam {
  private exam: ExamDocument | null;
  constructor(private id: string) {}
  static create(exam: IExam) {
    const examDoc = new ExamDoc({
      ...exam,
      questions: exam.questions.map((q, i) => ({ ...q, id: i })),
    });
    return examDoc.save();
  }
  static async getExams(query?: ExamFindQuery, isAdmin?: boolean) {
    try {
      const exams = await ExamDoc.find(query || {});
      let response = [];
      for (const e of exams) {
        const user = await User.createOrGetUser({ action: UserActions.ID, payload: e.teacherCreator });
        response.push({
          teacherCreator: user.doc.firstName + ' ' + user.doc.lastName,
          subject: e.subject,
          schoolYear: e.schoolYear,
          forMonth: e.forMonth,
          id: e._id,
          ...(isAdmin && { approved: e.approved }),
          ...(isAdmin && { available: e.available }),
        });
      }
      return response;
    } catch {
      throw new Error('something wrong');
    }
  }

  private async checkIfExamExist() {
    try {
      if (!this.exam) {
        const exam = await ExamDoc.findById(this.id);
        if (!exam) {
          throw new Error();
        }
        this.exam = exam;
      }
    } catch {
      const err: ErrorRequest = new Error('exam not found');
      err.code = 404;
      throw err;
    }
  }

  async getResponse(isAdmin?: boolean) {
    try {
      await this.checkIfExamExist();
      if (!isAdmin && !this.exam?.available) {
        const err: ErrorRequest = new Error('only admin can access this exam');
        err.code = 401;
        throw err;
      }
      const user = await User.createOrGetUser({ action: UserActions.ID, payload: this.exam?.teacherCreator });
      const response: ExamResponse = {
        id: this.exam?._id,
        questions: this.exam?.questions!,
        subject: this.exam?.subject!,
        schoolYear: this.exam?.schoolYear!,
        type: this.exam?.type,
        forMonth: this.exam?.forMonth,
      };
      if (isAdmin) {
        response.teacherCreator = { name: user.doc.firstName + ' ' + user.doc.lastName, id: user.id };
        response.approved = this.exam?.approved;
        response.info = this.exam?.info;
        response.totalScore = this.exam?.totalScore;
        response.available = this.exam?.available;
      }
      return response;
    } catch (err) {
      if (err.code) {
        throw err;
      }
      return null;
    }
  }
  async doc() {
    await this.checkIfExamExist();
    return { ...this.exam?._doc, _id: this.id };
  }

  async checkAnswer(answers: Answer[]) {
    await this.checkIfExamExist();
    if (!this.exam?.available) {
      const err: ErrorRequest = new Error('this exam not available now');
      err.code = 401;
      throw err;
    }
    let correctAnswers: Answer[] = [];
    for (const q of this.exam?.questions!) {
      const ans = answers.find((a) => a.questionId === q.id);
      if (!ans) {
        correctAnswers.push({ questionId: q.id, answer: '' });
      } else {
        correctAnswers.push({ questionId: q.id, answer: ans.answer });
      }
    }
    return correctAnswers;
  }

  async aproveExam() {
    await this.checkIfExamExist();
    this.exam!.approved = true;
    await this.exam?.save();
  }
  async availableExam(a: boolean) {
    await this.checkIfExamExist();
    this.exam!.available = a;
    await this.exam?.save();
  }

  async delete() {
    await this.checkIfExamExist();
    await this.exam?.delete();
  }
}

export default Exam;
