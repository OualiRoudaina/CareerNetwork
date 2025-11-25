import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  userType: 'candidate' | 'recruiter'; // Type d'utilisateur : candidat ou recruteur
  profile: {
    // Informations personnelles
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    photoUrl?: string;
    summary?: string;
    
    // Compétences
    skills: string[];
    
    // Éducation
    education: {
      degree: string;
      school: string;
      year: number;
      field?: string;
      description?: string;
    }[];
    
    // Expérience professionnelle
    experience: {
      title: string;
      company: string;
      duration: string;
      description: string;
      startDate?: string;
      endDate?: string;
      current?: boolean;
    }[];
    
    // Langues
    languages?: {
      name: string;
      level: string; // Débutant, Intermédiaire, Avancé, Natif
    }[];
    
    // Certifications
    certifications?: {
      name: string;
      issuer: string;
      date: string;
      expiryDate?: string;
    }[];
    
    // Projets
    projects?: {
      name: string;
      description: string;
      technologies: string[];
      url?: string;
    }[];
    
    cvUrl?: string;
    cvPdfGenerated?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    userType: {
      type: String,
      enum: ['candidate', 'recruiter'],
      default: 'candidate',
    },
    profile: {
      // Informations personnelles
      phone: String,
      address: String,
      city: String,
      country: String,
      postalCode: String,
      photoUrl: String,
      summary: String,
      
      // Compétences
      skills: [String],
      
      // Éducation
      education: [
        {
          degree: String,
          school: String,
          year: Number,
          field: String,
          description: String,
        },
      ],
      
      // Expérience professionnelle
      experience: [
        {
          title: String,
          company: String,
          duration: String,
          description: String,
          startDate: String,
          endDate: String,
          current: Boolean,
        },
      ],
      
      // Langues
      languages: [
        {
          name: String,
          level: String,
        },
      ],
      
      // Certifications
      certifications: [
        {
          name: String,
          issuer: String,
          date: String,
          expiryDate: String,
        },
      ],
      
      // Projets
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
          url: String,
        },
      ],
      
      cvUrl: String,
      cvPdfGenerated: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

