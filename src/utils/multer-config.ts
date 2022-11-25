import { DiskStorageOptions, FileFilterCallback } from 'multer';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { Request } from 'express';
import { ErrorRequest } from '../types/reqError';

const storageLessonConfig: DiskStorageOptions = {
  destination(_, __, callback) {
    return callback(null, path.join(__dirname, '..', 'uploads', 'lessons'));
  },
  filename(_, file, callback) {
    const uuid = randomUUID().toString();
    callback(null, uuid + '-' + file.originalname);
  },
};

export const videoFileFilter = (_: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  const supportedExt = ['.flv', '.mkv', '.wmv', '.mp4'];
  var ext = extname(file.originalname);
  if (supportedExt.includes(ext)) {
    return callback(null, true);
  }
  const err: ErrorRequest = new Error('video type not supported');
  err.code = 401;
  throw err;
};

export default storageLessonConfig;
