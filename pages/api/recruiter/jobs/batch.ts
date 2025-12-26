import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
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

  // Vérifier que l'utilisateur est un recruteur
  const user = await User.findById(session.user.id);
  if (!user || user.userType !== 'recruiter') {
    return res.status(403).json({ message: 'Only recruiters can access this' });
  }

  if (req.method === 'POST') {
    try {
      const { action, jobIds } = req.body;

      if (!action || !jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
        return res.status(400).json({ message: 'Action and job IDs are required' });
      }

      // Vérifier que tous les jobs appartiennent au recruteur
      const jobs = await Job.find({
        _id: { $in: jobIds },
        postedBy: session.user.id,
      });

      if (jobs.length !== jobIds.length) {
        return res.status(403).json({ message: 'Some jobs do not belong to you' });
      }

      let result;
      switch (action) {
        case 'activate':
          result = await Job.updateMany(
            { _id: { $in: jobIds } },
            { $set: { isActive: true } }
          );
          return res.status(200).json({ message: `${result.modifiedCount} jobs activated` });

        case 'deactivate':
          result = await Job.updateMany(
            { _id: { $in: jobIds } },
            { $set: { isActive: false } }
          );
          return res.status(200).json({ message: `${result.modifiedCount} jobs deactivated` });

        case 'delete':
          result = await Job.deleteMany({ _id: { $in: jobIds } });
          return res.status(200).json({ message: `${result.deletedCount} jobs deleted` });

        default:
          return res.status(400).json({ message: 'Invalid action' });
      }
    } catch (error: any) {
      console.error('Batch jobs error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}







