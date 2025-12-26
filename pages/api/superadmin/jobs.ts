import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'superadmin') {
    return res.status(401).json({ message: 'Unauthorized - Super Admin only' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { status } = req.query;
      
      let query: any = {};
      if (status) {
        query.status = status;
      }
      
      // Essayer d'abord avec tous les populates
      try {
        const jobs = await Job.find(query)
          .populate('postedBy', 'name email')
          .populate('approvedBy', 'name email')
          .sort({ createdAt: -1 });

        return res.status(200).json({ jobs });
      } catch (populateError: any) {
        // Si l'erreur est liée à strictPopulate pour approvedBy, essayer sans populate approvedBy
        if (populateError.name === 'StrictPopulateError' && populateError.path === 'approvedBy') {
          console.warn('Cannot populate approvedBy, fetching without it');
          const jobs = await Job.find(query)
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });
          
          return res.status(200).json({ jobs });
        }
        // Si c'est une autre erreur, la propager
        throw populateError;
      }
    } catch (error: any) {
      console.error('Get jobs error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { jobId, action, rejectionReason } = req.body;

      if (!jobId || !action) {
        return res.status(400).json({ message: 'Job ID and action are required' });
      }

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'Action must be approve or reject' });
      }

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      if (action === 'approve') {
        job.status = 'approved';
        job.isActive = true;
        job.approvedBy = session.user.id;
        job.approvedAt = new Date();
        job.rejectionReason = undefined;
      } else if (action === 'reject') {
        job.status = 'rejected';
        job.isActive = false;
        job.approvedBy = session.user.id;
        job.approvedAt = new Date();
        if (rejectionReason) {
          job.rejectionReason = rejectionReason;
        }
      }

      await job.save();

      return res.status(200).json({
        message: `Job ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        job,
      });
    } catch (error: any) {
      console.error('Update job status error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

