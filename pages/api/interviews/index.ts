import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Interview from '@/models/Interview';
import Application from '@/models/Application';
import User from '@/models/User';
import { createNotification } from '../notifications';
import { sendEmail, generateInterviewReminderEmail } from '@/lib/email';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { applicationId, upcoming } = req.query;
      const user = await User.findById(session.user.id);

      let query: any = {};
      if (user?.userType === 'candidate') {
        query.candidate = session.user.id;
      } else if (user?.userType === 'recruiter') {
        query.recruiter = session.user.id;
      }

      if (applicationId) {
        query.application = applicationId;
      }

      if (upcoming === 'true') {
        query.scheduledAt = { $gte: new Date() };
        query.status = 'scheduled';
      }

      const interviews = await Interview.find(query)
        .populate('application', 'job')
        .populate('candidate', 'name email')
        .populate('recruiter', 'name email')
        .populate({
          path: 'application',
          populate: { path: 'job', select: 'title company' },
        })
        .sort({ scheduledAt: 1 });

      return res.status(200).json({ interviews });
    } catch (error: any) {
      console.error('Get interviews error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { applicationId, scheduledAt, duration, type, location, notes } = req.body;

      if (!applicationId || !scheduledAt) {
        return res.status(400).json({ message: 'Application ID and scheduled date are required' });
      }

      const application = await Application.findById(applicationId);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      const user = await User.findById(session.user.id);
      if (user?.userType !== 'recruiter' || application.recruiter.toString() !== session.user.id) {
        return res.status(403).json({ message: 'Only the recruiter can schedule interviews' });
      }

      const candidate = await User.findById(application.candidate);

      const interview = await Interview.create({
        application: applicationId,
        recruiter: session.user.id,
        candidate: application.candidate,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
        type: type || 'video',
        location,
        notes,
        status: 'scheduled',
      });

      // Créer des notifications
      await createNotification(
        application.candidate.toString(),
        'interview',
        'Nouvel entretien programmé',
        `Un entretien a été programmé pour le ${new Date(scheduledAt).toLocaleDateString('fr-FR')}`,
        `/interviews/${interview._id}`,
        interview._id.toString()
      );

      await createNotification(
        session.user.id,
        'interview',
        'Entretien programmé',
        `Entretien avec ${candidate?.name} programmé`,
        `/interviews/${interview._id}`,
        interview._id.toString()
      );

      // Envoyer un email au candidat
      if (candidate?.email) {
        const emailOptions = generateInterviewReminderEmail(
          candidate.name,
          'Poste', // Sera amélioré avec le titre du job
          new Date(scheduledAt),
          type || 'video',
          location
        );
        emailOptions.to = candidate.email;
        await sendEmail(emailOptions);
      }

      const populatedInterview = await Interview.findById(interview._id)
        .populate('application', 'job')
        .populate('candidate', 'name email')
        .populate('recruiter', 'name email');

      return res.status(201).json({ interview: populatedInterview });
    } catch (error: any) {
      console.error('Create interview error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { interviewId, scheduledAt, duration, type, location, notes, status } = req.body;

      if (!interviewId) {
        return res.status(400).json({ message: 'Interview ID is required' });
      }

      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found' });
      }

      const user = await User.findById(session.user.id);
      if (
        user?.userType === 'candidate' &&
        interview.candidate.toString() !== session.user.id &&
        status !== 'cancelled'
      ) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const updateData: any = {};
      if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
      if (duration) updateData.duration = duration;
      if (type) updateData.type = type;
      if (location !== undefined) updateData.location = location;
      if (notes !== undefined) updateData.notes = notes;
      if (status) updateData.status = status;

      const updatedInterview = await Interview.findByIdAndUpdate(interviewId, updateData, { new: true })
        .populate('application', 'job')
        .populate('candidate', 'name email')
        .populate('recruiter', 'name email');

      return res.status(200).json({ interview: updatedInterview });
    } catch (error: any) {
      console.error('Update interview error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}





