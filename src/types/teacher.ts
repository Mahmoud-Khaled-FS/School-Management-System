import { RegisterBody } from './auth';
import { QuestionTypes } from './enums';

export interface CreateTeacherBody extends RegisterBody {
  qualification: string;
  experiance: number;
  address: string;
  subject: string;
  bio: string;
}

export interface EditTeacherBody {
  qualification?: string;
  experiance?: number;
  address?: string;
  subject?: string;
  bio?: string;
}

export interface Answer {
  questionId: number;
  answer: string;
}
export interface Question {
  question: string;
  type: QuestionTypes;
  answers?: string[];
  id: number;
}
