import mongoose from 'mongoose';
import { GenderEnum, UserRole } from '../types/enums';
import { ErrorRequest } from '../types/reqError';
import Student, { IStudent, StudentActions } from './student';
import * as bcrypt from 'bcryptjs';
import UserResponse, { StudentResponse, TeacherResponse } from '../types/response';
import Teacher, { ITeacher, TeacherActions } from './teacher';

export enum UserActions {
  EMAIL = 'EMAIL',
  ID = 'ID',
  NEW = 'NEW_USER',
}

export interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: GenderEnum;
  dateOfBirth: Date;
  role: UserRole;
  roleId: mongoose.Schema.Types.ObjectId;
}

export interface UserDocument extends IUser, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  _doc?: IUser;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    role: {
      type: String,
      default: UserRole.USER,
    },
    roleId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true },
);

const UserDoc = mongoose.model<UserDocument>('user', userSchema);

class User {
  private user: UserDocument;
  role: Student | Teacher | null;
  private constructor() {}

  // user static function
  static async createOrGetUser(user: { action: UserActions; payload: any }, userRole?: IStudent | ITeacher) {
    const userObj = new User();
    switch (user.action) {
      case UserActions.ID:
        userObj.user = await userObj.getUserById(user.payload);
        break;
      case UserActions.EMAIL:
        userObj.user = await userObj.getUserByEmail(user.payload);
        break;
      case UserActions.NEW:
        userObj.user = await userObj.createNewUser(user.payload, userRole);
        break;
    }
    return userObj;
  }

  //Private method
  private async getUserByEmail(email: string) {
    const user = await UserDoc.findOne({ email: email });
    if (!user) {
      throw new Error('user not exist');
    }
    return user;
  }
  private async getUserById(id: string) {
    try {
      const user = await UserDoc.findById(id);
      if (!user) {
        throw new Error();
      }
      return user;
    } catch {
      throw new Error(`user with id ${id} not exist`);
    }
  }
  private async createNewUser(user: IUser, userRole?: IStudent | ITeacher) {
    const isUserExist = await UserDoc.findOne({ email: user.email });
    if (isUserExist) {
      const err: ErrorRequest = new Error('email is exists');
      err.code = 400;
      throw err;
    }
    const passwordHashed = await bcrypt.hash(user.password, 16);
    if (!passwordHashed) {
      const err: ErrorRequest = new Error('Something wrong!');
      err.code = 500;
      throw err;
    }
    const newUser = new UserDoc({ ...user, password: passwordHashed });
    if (userRole) {
      if (user.role === UserRole.STUDENT) {
        this.role = await Student.getOrCreateStduent({ action: StudentActions.NEW, payload: userRole });
      }
      if (user.role === UserRole.TEACHER) {
        this.role = await Teacher.getOrCreateTeacher({ action: TeacherActions.NEW, payload: userRole });
      }
      newUser.roleId = this.role?.id;
    }
    await newUser.save();
    return newUser;
  }
  // Puplic methods
  async getRole() {
    if (this.role || this.user.role === UserRole.ADMIN || this.user.role === UserRole.USER) return;
    if (this.user.role === UserRole.STUDENT) {
      this.role = await Student.getOrCreateStduent({ action: StudentActions.ID, payload: this.user.roleId });
      return this.role;
    }
    if (this.user.role === UserRole.TEACHER) {
      this.role = await Teacher.getOrCreateTeacher({ action: TeacherActions.ID, payload: this.user.roleId });
      return this.role;
    }
    throw new Error('something wrong ');
  }
  createUserResponse(info?: boolean) {
    const date = new Date(this.user.dateOfBirth);
    const userResponse: UserResponse<StudentResponse | TeacherResponse> = {
      id: this.user._id,
      email: this.user.email,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      displayName: `${this.user.firstName} ${this.user.lastName}`,
      phone: this.user.phone,
      gender: this.user.gender,
      dateOfBirth: {
        timestamp: this.user.dateOfBirth,
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        formatDate: `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`,
      },
      role: this.user.role,
      create_at: this.user.createdAt,
      update_at: this.user.updatedAt,
    };
    if (info && this.role) {
      userResponse.info = this.role.getResponse();
    }
    return userResponse;
  }

  async delete() {
    if (!this.role) {
      await this.getRole();
    }
    if (this.doc.role === UserRole.STUDENT || this.doc.role === UserRole.TEACHER) {
      this.role?.delete();
    }
    await this.user.delete();
  }

  get id() {
    return this.user._id!;
  }
  get doc() {
    return this.user._doc!;
  }
}

export default User;
