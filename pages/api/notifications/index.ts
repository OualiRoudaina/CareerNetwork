import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await dbConnect();
  } catch (error: any) {
    console.error('Database connection error:', error);
    return res.status(503).json({ 
      message: 'Database connection failed. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  if (req.method === 'GET') {
    try {
      const { read, limit = 50 } = req.query;

      let query: any = { user: session.user.id };
      if (read !== undefined) {
        query.read = read === 'true';
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string));

      const unreadCount = await Notification.countDocuments({
        user: session.user.id,
        read: false,
      });

      return res.status(200).json({
        notifications,
        unreadCount,
      });
    } catch (error: any) {
      console.error('Get notifications error:', error);
      
      // Handle MongoDB connection errors
      if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkTimeoutError') {
        return res.status(503).json({ 
          message: 'Database connection timeout. Please check your network connection and try again.',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      
      return res.status(500).json({ 
        message: error.message || 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { notificationId, read } = req.body;

      if (!notificationId) {
        return res.status(400).json({ message: 'Notification ID is required' });
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: session.user.id },
        { read: read === true || read === 'true' },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      return res.status(200).json({ notification });
    } catch (error: any) {
      console.error('Update notification error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { notificationId } = req.query;

      if (notificationId) {
        // Supprimer une notification spécifique
        await Notification.findOneAndDelete({
          _id: notificationId,
          user: session.user.id,
        });
      } else {
        // Supprimer toutes les notifications lues
        await Notification.deleteMany({
          user: session.user.id,
          read: true,
        });
      }

      return res.status(200).json({ message: 'Notifications deleted' });
    } catch (error: any) {
      console.error('Delete notifications error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

// Fonction utilitaire pour créer une notification
export async function createNotification(
  userId: string,
  type: 'job_application' | 'application_status' | 'new_job' | 'message' | 'interview' | 'reminder',
  title: string,
  message: string,
  link?: string,
  relatedId?: string
) {
  await dbConnect();
  return await Notification.create({
    user: userId,
    type,
    title,
    message,
    link,
    relatedId,
  });
}





