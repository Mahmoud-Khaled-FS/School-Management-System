import mongoose from 'mongoose';
import { ErrorRequest } from '../types/reqError';
import { AssignmentResponse } from '../types/response';
import { Answer, Question } from '../types/teacher';
import Class from './class';
import Student from './student';
import User, { UserActions } from './user';

export interface IAssignment {
  teacherCreator: mongoose.Types.ObjectId;
  subject: string;
  questions: Question[];
  classes: mongoose.Types.ObjectId[];
}

export interface AssignmentDocument extends IAssignment, mongoose.Document {
  createdAt: string;
  updatedAt: string;
  _doc?: IAssignment;
}

const assignmentSchema = new mongoose.Schema<IAssignment>(
  {
    teacherCreator: mongoose.Types.ObjectId,
    subject: String,
    classes: [
      {
        type: mongoose.Types.ObjectId,
        required: true,
      },
    ],
    questions: [
      {
        type: { type: String },
        question: String,
        answers: [String],
        id: Number,
        _id: false,
      },
    ],
  },
  { timestamps: true },
);

const AssignmentDoc = mongoose.model<AssignmentDocument>('assignment', assignmentSchema);

class Assignment {
  private assignment: AssignmentDocument | null;
  constructor(private id: string) {}
  static create(assignment: IAssignment) {
    const assignmentDoc = new AssignmentDoc({
      ...assignment,
      questions: assignment.questions.map((q, i) => ({ ...q, id: i })),
    });
    return assignmentDoc.save();
  }
  private async checkIfAssignmentExist() {
    try {
      if (!this.assignment) {
        const assignment = await AssignmentDoc.findById(this.id);
        if (!assignment) {
          throw new Error();
        }
        this.assignment = assignment;
      }
    } catch {
      const err: ErrorRequest = new Error('assignment not found');
      err.code = 404;
      throw err;
    }
  }

  static async getAssignmentForStudent(studentId: string) {
    const user = await User.createOrGetUser({ action: UserActions.ID, payload: studentId });
    const student = (await user.getRole()) as Student;
    const assignments = await AssignmentDoc.find({ classes: student.doc.classId });
    return assignments;
  }

  async getResponse() {
    try {
      await this.checkIfAssignmentExist();
      const date = new Date(this.assignment?.createdAt!);
      const user = await User.createOrGetUser({ action: UserActions.ID, payload: this.assignment?.teacherCreator });
      type ClassResponse = { year: number; class: string };
      const classes: ClassResponse[] = [];
      for (const clsId of this.assignment?.classes!) {
        const cls = await Class.get(clsId.toString());
        classes.push({ class: cls?.class!, year: cls?.year! });
      }
      const response: AssignmentResponse = {
        id: this.assignment?._id,
        date: {
          day: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
        },
        questions: this.assignment?.questions!,
        teatcherName: user.doc.firstName + ' ' + user.doc.lastName,
        subject: this.assignment?.subject!,
        classes: classes,
      };
      return response;
    } catch (err) {
      if (err.code) {
        throw err;
      }
      return null;
    }
  }
  async doc() {
    await this.checkIfAssignmentExist();
    return { ...this.assignment?._doc, _id: this.id };
  }

  async checkAnswer(answers: Answer[]) {
    await this.checkIfAssignmentExist();
    let correctAnswers: Answer[] = [];
    for (const q of this.assignment?.questions!) {
      const ans = answers.find((a) => a.questionId === q.id);
      if (!ans) {
        correctAnswers.push({ questionId: q.id, answer: '' });
      } else {
        correctAnswers.push({ questionId: q.id, answer: ans.answer });
      }
    }
    return correctAnswers;
  }
}

export default Assignment;
