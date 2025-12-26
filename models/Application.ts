import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  candidate: mongoose.Types.ObjectId;
  recruiter: mongoose.Types.ObjectId;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  customStatus?: string; // Statut personnalisé défini par le recruteur
  coverLetter?: string;
  cvUrl?: string;
  appliedAt: Date;
  reviewedAt?: Date;
  statusHistory?: {
    status: string;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
    note?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected'],
      default: 'pending',
    },
    customStatus: {
      type: String,
    },
    coverLetter: {
      type: String,
    },
    cvUrl: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
    statusHistory: [
      {
        status: String,
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        changedAt: Date,
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index pour éviter les candidatures en double
ApplicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;



