import { GenderEnum, UserRole } from './enums';

export interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: GenderEnum;
  dateOfBirth: Date;
  role: UserRole;
}

export interface LoginBody {
  email: string;
  password: string;
}
