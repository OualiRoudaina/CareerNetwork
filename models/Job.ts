import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  postedBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [String],
    skills: [String],
    experience: {
      type: String,
      required: true,
    },
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'EUR',
      },
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    strictPopulate: false, // Désactiver strictPopulate pour permettre le populate de champs optionnels
  }
);

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;

