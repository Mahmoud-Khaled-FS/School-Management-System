import mongoose from 'mongoose';

export interface Lesson {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  author: mongoose.Types.ObjectId | string;
}

export interface Article {
  title: string;
  body: string;
  author: mongoose.Types.ObjectId | string;
}
