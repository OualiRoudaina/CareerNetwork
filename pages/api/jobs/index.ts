import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import User from '@/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { search, location, experience, type, skills } = req.query;

      // Inclure les jobs approuvés OU les jobs sans statut (rétrocompatibilité avec les jobs existants)
      let query: any = { 
        isActive: true,
        $or: [
          { status: 'approved' },
          { status: { $exists: false } }, // Jobs créés avant l'ajout du système d'approbation
          { status: null } // Jobs avec statut null
        ]
      };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }

      if (experience) {
        query.experience = { $regex: experience, $options: 'i' };
      }

      if (type) {
        query.type = type;
      }

      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        query.skills = { $in: skillsArray };
      }

      const jobs = await Job.find(query).sort({ createdAt: -1 });

      return res.status(200).json({ jobs });
    } catch (error: any) {
      console.error('Get jobs error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Vérifier que l'utilisateur est un recruteur
      const User = (await import('@/models/User')).default;
      const user = await User.findById(session.user.id);
      
      if (!user || user.userType !== 'recruiter') {
        return res.status(403).json({ message: 'Only recruiters can post jobs' });
      }

      const {
        title,
        company,
        location,
        description,
        requirements,
        skills,
        experience,
        salary,
        type,
      } = req.body;

      if (!title || !company || !location || !description || !experience) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const job = await Job.create({
        title,
        company,
        location,
        description,
        requirements: requirements || [],
        skills: skills || [],
        experience,
        salary,
        type: type || 'full-time',
        isActive: false, // Inactif jusqu'à approbation
        status: 'pending', // En attente d'approbation
        postedBy: session.user.id,
      });

      return res.status(201).json({ message: 'Job created', job });
    } catch (error: any) {
      console.error('Create job error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

