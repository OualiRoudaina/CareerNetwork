import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

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
      const users = await User.find().select('-password').sort({ createdAt: -1 });

      return res.status(200).json({ users });
    } catch (error: any) {
      console.error('Get users error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: 'User ID required' });
      }

      await User.findByIdAndDelete(id);

      return res.status(200).json({ message: 'User deleted' });
    } catch (error: any) {
      console.error('Delete user error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

