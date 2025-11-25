import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';
import User from '@/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  if (req.method === 'POST') {
    try {
      const user = await User.findById(session.user.id);
      if (!user || user.userType !== 'candidate') {
        return res.status(403).json({ message: 'Only candidates can apply' });
      }

      const { jobId, coverLetter } = req.body;

      if (!jobId) {
        return res.status(400).json({ message: 'Job ID is required' });
      }

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      if (!job.isActive) {
        return res.status(400).json({ message: 'This job is not active' });
      }

      // Vérifier si l'utilisateur a déjà postulé
      const existingApplication = await Application.findOne({
        job: jobId,
        candidate: session.user.id,
      });

      if (existingApplication) {
        return res.status(400).json({ message: 'You have already applied to this job' });
      }

      const application = await Application.create({
        job: jobId,
        candidate: session.user.id,
        recruiter: job.postedBy,
        coverLetter: coverLetter || '',
        status: 'pending',
      });

      return res.status(201).json({ message: 'Application submitted', application });
    } catch (error: any) {
      console.error('Create application error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'GET') {
    try {
      const user = await User.findById(session.user.id);
      const { jobId, recruiter } = req.query;

      let query: any = {};

      if (user?.userType === 'candidate') {
        // Les candidats voient leurs propres candidatures
        query.candidate = session.user.id;
      } else if (user?.userType === 'recruiter') {
        // Les recruteurs voient les candidatures pour leurs offres
        query.recruiter = session.user.id;
      } else {
        return res.status(403).json({ message: 'Invalid user type' });
      }

      if (jobId) {
        query.job = jobId;
      }

      const applications = await Application.find(query)
        .populate('job', 'title company location')
        .populate('candidate', 'name email profile')
        .sort({ createdAt: -1 });

      return res.status(200).json({ applications });
    } catch (error: any) {
      console.error('Get applications error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}



