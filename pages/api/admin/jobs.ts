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

  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized - Admin only' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const jobs = await Job.find().sort({ createdAt: -1 });

      return res.status(200).json({ jobs });
    } catch (error: any) {
      console.error('Get all jobs error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

