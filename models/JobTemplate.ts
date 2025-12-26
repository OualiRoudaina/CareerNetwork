import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJobTemplate extends Document {
  name: string;
  recruiter: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const JobTemplateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
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
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'EUR',
      },
    },
  },
  {
    timestamps: true,
  }
);

const JobTemplate: Model<IJobTemplate> =
  mongoose.models.JobTemplate || mongoose.model<IJobTemplate>('JobTemplate', JobTemplateSchema);

export default JobTemplate;







