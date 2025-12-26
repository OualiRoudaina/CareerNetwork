import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  application: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  isInternal: boolean; // Si true, visible uniquement par les recruteurs
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    application: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isInternal: {
      type: Boolean,
      default: true, // Par défaut, les commentaires sont internes
    },
  },
  {
    timestamps: true,
  }
);

// Index pour les requêtes fréquentes
CommentSchema.index({ application: 1, createdAt: -1 });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;





