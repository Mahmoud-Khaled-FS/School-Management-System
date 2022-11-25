import { UserRole } from './enums';
import { Question } from './teacher';

export default interface UserResponse<T = null> {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  gender: string;
  dateOfBirth: {
    timestamp: Date;
    day: number;
    month: number;
    year: number;
    formatDate: string;
  };
  role: UserRole;
  info?: T;
  create_at: Date;
  update_at: Date;
}

export interface StudentResponse {
  classId: string;
  class: string;
  yearLevel: {
    year: number;
    name: string;
    englishName: string;
  };
  about?: string;
  health?: {
    weight?: {
      pound: number;
      kg: number;
    } | null;
    height?: {
      inch: number;
      cm: number;
    } | null;
    allergicHistory?: string;
    bloodGroup?: string;
  };
  parents?: {
    father: {
      name?: string;
      email?: string;
      phone?: string;
    };
    mother: {
      name?: string;
      email?: string;
      phone?: string;
    };
    adderss: {
      address1?: string;
      address2?: string;
      zip?: number;
    };
  };
}

export interface TeacherResponse {
  qualification: string;
  experiance: number;
  classesTaken?: string[];
  address: string;
  subject: string;
  bio: string;
}

export interface AssignmentResponse {
  id: string;
  teatcherName: string;
  date: {
    day: number;
    month: number;
    year: number;
  };
  classes?: {
    class: string;
    year: number;
  }[];
  questions: Question[];
  subject: string;
}

export interface ExamResponse {
  id: string;
  teacherCreator?: { id: string; name: string };
  subject: string;
  questions: Question[];
  schoolYear: number;
  totalScore?: number;
  type?: string;
  info?: string;
  forMonth?: number;
  approved?: boolean;
  available?: boolean;
}
