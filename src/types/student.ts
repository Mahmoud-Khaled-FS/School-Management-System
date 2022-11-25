import { RegisterBody } from './auth';

export interface CreateStudentBody extends RegisterBody {
  about: string;
  yearLevel: string;
  classNumber: number;
  weight?: number;
  height?: number;
  allergicHistory?: string;
  bloodGroup?: string;
  fatherName?: string;
  fatherEmail?: string;
  fatherPhone?: string;
  motherName?: string;
  motherEmail?: string;
  motherPhone?: string;
  address1?: string;
  address2?: string;
  zip?: number;
}

export interface EditMainStudentInfo {
  about?: string;
  yearLevel?: string;
  classNumber?: number;
}
export interface EditMainStudentHealth {
  weight?: number;
  height?: number;
  allergicHistory?: string;
  bloodGroup?: string;
}
export interface EditMainStudentParents {
  fatherEmail?: string;
  fatherPhone?: string;
  motherEmail?: string;
  motherPhone?: string;
  address1?: string;
  address2?: string;
  zip?: number;
}
export interface EditStudentBody extends EditMainStudentInfo, EditMainStudentHealth, EditMainStudentParents {}
