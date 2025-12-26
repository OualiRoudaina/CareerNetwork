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

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const job = await Job.findById(id);

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      return res.status(200).json({ job });
    } catch (error: any) {
      console.error('Get job error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const job = await Job.findById(id);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Vérifier que l'utilisateur est le propriétaire ou un superadmin
      const user = await User.findById(session.user.id);
      if (user?.role !== 'superadmin' && job.postedBy?.toString() !== session.user.id) {
        return res.status(403).json({ message: 'You can only update your own jobs' });
      }
      
      // Si un job est mis à jour, remettre en pending si ce n'est pas un superadmin
      if (user?.role !== 'superadmin' && job.status === 'approved') {
        req.body.status = 'pending';
        req.body.isActive = false;
      }

      const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json({ message: 'Job updated', job: updatedJob });
    } catch (error: any) {
      console.error('Update job error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const job = await Job.findById(id);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Vérifier que l'utilisateur est le propriétaire ou un superadmin
      const user = await User.findById(session.user.id);
      if (user?.role !== 'superadmin' && job.postedBy?.toString() !== session.user.id) {
        return res.status(403).json({ message: 'You can only delete your own jobs' });
      }

      const deletedJob = await Job.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Job deleted', job: deletedJob });
    } catch (error: any) {
      console.error('Delete job error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

