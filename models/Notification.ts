import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'job_application' | 'application_status' | 'new_job' | 'message' | 'interview' | 'reminder';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  relatedId?: mongoose.Types.ObjectId; // ID de l'application, job, message, etc.
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['job_application', 'application_status', 'new_job', 'message', 'interview', 'reminder'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour les requêtes fréquentes
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;





