import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';
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
      const application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      // Vérifier les permissions
      const user = await User.findById(session.user.id);
      if (
        user?.userType === 'candidate' &&
        application.candidate.toString() !== session.user.id
      ) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (user?.userType === 'recruiter' && application.recruiter.toString() !== session.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Les candidats ne voient que les commentaires non internes
      const query: any = { application: id };
      if (user?.userType === 'candidate') {
        query.isInternal = false;
      }

      const comments = await Comment.find(query)
        .populate('author', 'name email')
        .sort({ createdAt: -1 });

      return res.status(200).json({ comments });
    } catch (error: any) {
      console.error('Get comments error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { content, isInternal = true } = req.body;

      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }

      const application = await Application.findById(id);
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

      const comment = await Comment.create({
        application: id,
        author: session.user.id,
        content,
        isInternal: user?.userType === 'recruiter' ? isInternal : false, // Les candidats ne peuvent pas créer de commentaires internes
      });

      const populatedComment = await Comment.findById(comment._id).populate('author', 'name email');

      return res.status(201).json({ comment: populatedComment });
    } catch (error: any) {
      console.error('Create comment error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}





