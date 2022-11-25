import mongoose from 'mongoose';

type Id = string | mongoose.Types.ObjectId;

export interface ILive {
  teacherId: Id;
  roomId: string;
  subject: string;
  forClasses?: Id[];
  video?: string;
}

export interface LiveDocument extends ILive, mongoose.Document {
  createdAt: string;
  updatedAt: string;
  _doc?: ILive;
}

const liveSchema = new mongoose.Schema<ILive>(
  {
    teacherId: {
      type: String,
      required: true,
    },
    forClasses: [String],
    subject: { type: String, required: true },
    roomId: { type: String, required: true },
    video: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<LiveDocument>('live', liveSchema);
