import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import User from '@/models/User';
import Job from '@/models/Job';
import { createNotification } from '../notifications';
import { sendEmail, generateApplicationStatusEmail } from '@/lib/email';

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

      const { status, customStatus, note } = req.body;

      if (status && !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const application = await Application.findById(id)
        .populate('job', 'title company')
        .populate('candidate', 'name email');
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      // Vérifier que le recruteur est le propriétaire de l'offre
      if (application.recruiter.toString() !== session.user.id) {
        return res.status(403).json({ message: 'You can only update applications for your jobs' });
      }

      const oldStatus = application.status;
      const updateData: any = {};
      
      if (status) {
        updateData.status = status;
        if (status !== 'pending') {
          updateData.reviewedAt = new Date();
        }
      }
      
      if (customStatus !== undefined) {
        updateData.customStatus = customStatus;
      }

      // Ajouter à l'historique si le statut a changé
      if (status && status !== oldStatus) {
        const statusHistoryEntry = {
          status: status,
          changedBy: session.user.id,
          changedAt: new Date(),
          note: note || '',
        };
        
        updateData.$push = {
          statusHistory: statusHistoryEntry,
        };
      }

      const updatedApplication = await Application.findByIdAndUpdate(id, updateData, { new: true })
        .populate('job', 'title company')
        .populate('candidate', 'name email');

      // Créer une notification pour le candidat
      if (status && status !== oldStatus && application.candidate) {
        const candidate = application.candidate as any;
        const job = application.job as any;
        
        await createNotification(
          candidate._id.toString(),
          'application_status',
          `Mise à jour de votre candidature`,
          `Votre candidature pour ${job.title} chez ${job.company} a été mise à jour : ${status}`,
          `/applications/${id}`,
          id as string
        );

        // Envoyer un email au candidat
        if (candidate.email && ['accepted', 'rejected', 'reviewed'].includes(status)) {
          const emailOptions = generateApplicationStatusEmail(
            candidate.name,
            job.title,
            job.company,
            status
          );
          emailOptions.to = candidate.email;
          await sendEmail(emailOptions);
        }
      }

      return res.status(200).json({ message: 'Application updated', application: updatedApplication });
    } catch (error: any) {
      console.error('Update application error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}



