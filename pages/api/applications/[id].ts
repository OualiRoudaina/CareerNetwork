import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
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

  if (req.method === 'PUT') {
    try {
      const user = await User.findById(session.user.id);
      if (!user || user.userType !== 'recruiter') {
        return res.status(403).json({ message: 'Only recruiters can update applications' });
      }

      const { status } = req.body;

      if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      // Vérifier que le recruteur est le propriétaire de l'offre
      if (application.recruiter.toString() !== session.user.id) {
        return res.status(403).json({ message: 'You can only update applications for your jobs' });
      }

      const updateData: any = { status };
      if (status !== 'pending') {
        updateData.reviewedAt = new Date();
      }

      const updatedApplication = await Application.findByIdAndUpdate(id, updateData, { new: true });

      return res.status(200).json({ message: 'Application updated', application: updatedApplication });
    } catch (error: any) {
      console.error('Update application error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}



