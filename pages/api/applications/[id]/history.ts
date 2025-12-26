import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
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

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const application = await Application.findById(id)
        .populate('statusHistory.changedBy', 'name email');

      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      // Vérifier les permissions
      const user = await User.findById(session.user.id);
      if (user?.userType === 'candidate' && application.candidate.toString() !== session.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (user?.userType === 'recruiter' && application.recruiter.toString() !== session.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      return res.status(200).json({
        history: application.statusHistory || [],
        currentStatus: application.status,
        customStatus: application.customStatus,
      });
    } catch (error: any) {
      console.error('Get application history error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}





