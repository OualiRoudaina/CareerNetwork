import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import JobTemplate from '@/models/JobTemplate';
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

  if (req.method === 'GET') {
    try {
      const templates = await JobTemplate.find({ recruiter: session.user.id }).sort({ createdAt: -1 });
      return res.status(200).json({ templates });
    } catch (error: any) {
      console.error('Get templates error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, title, description, requirements, skills, experience, type, salary } = req.body;

      if (!name || !title || !description || !experience) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const template = await JobTemplate.create({
        name,
        recruiter: session.user.id,
        title,
        description,
        requirements: requirements || [],
        skills: skills || [],
        experience,
        type: type || 'full-time',
        salary,
      });

      return res.status(201).json({ message: 'Template created', template });
    } catch (error: any) {
      console.error('Create template error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'Template ID is required' });
      }

      await JobTemplate.findOneAndDelete({ _id: id, recruiter: session.user.id });
      return res.status(200).json({ message: 'Template deleted' });
    } catch (error: any) {
      console.error('Delete template error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}







