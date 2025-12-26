import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInterview extends Document {
  application: mongoose.Types.ObjectId;
  recruiter: mongoose.Types.ObjectId;
  candidate: mongoose.Types.ObjectId;
  scheduledAt: Date;
  duration: number; // en minutes
  type: 'phone' | 'video' | 'in-person';
  location?: string; // Pour les entretiens en personne ou vidéo
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema: Schema = new Schema(
  {
    application: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    candidate: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 60, // 60 minutes par défaut
    },
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person'],
      default: 'video',
    },
    location: {
      type: String,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour les requêtes fréquentes
InterviewSchema.index({ application: 1 });
InterviewSchema.index({ candidate: 1, scheduledAt: 1 });
InterviewSchema.index({ recruiter: 1, scheduledAt: 1 });
InterviewSchema.index({ scheduledAt: 1, reminderSent: 1 }); // Pour les rappels

const Interview: Model<IInterview> = mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);

export default Interview;





