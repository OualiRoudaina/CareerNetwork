import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';
import User from '@/models/User';
import { createNotification } from '../notifications';

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
      const { recipientId, applicationId } = req.query;

      let query: any = {
        $or: [{ sender: session.user.id }, { recipient: session.user.id }],
      };

      if (recipientId) {
        query = {
          $or: [
            { sender: session.user.id, recipient: recipientId },
            { sender: recipientId, recipient: session.user.id },
          ],
        };
      }

      if (applicationId) {
        query.application = applicationId;
      }

      const messages = await Message.find(query)
        .populate('sender', 'name email')
        .populate('recipient', 'name email')
        .sort({ createdAt: -1 });

      return res.status(200).json({ messages });
    } catch (error: any) {
      console.error('Get messages error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { recipientId, applicationId, subject, content } = req.body;

      if (!recipientId || !subject || !content) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Vérifier que le destinataire existe
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
      }

      const message = await Message.create({
        sender: session.user.id,
        recipient: recipientId,
        application: applicationId,
        subject,
        content,
      });

      // Créer une notification pour le destinataire
      await createNotification(
        recipientId,
        'message',
        `Nouveau message de ${session.user.name}`,
        subject,
        `/messages?conversation=${session.user.id}`,
        message._id.toString()
      );

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name email')
        .populate('recipient', 'name email');

      return res.status(201).json({ message: populatedMessage });
    } catch (error: any) {
      console.error('Create message error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { messageId, read } = req.body;

      if (!messageId) {
        return res.status(400).json({ message: 'Message ID is required' });
      }

      const updateData: any = {};
      if (read !== undefined) {
        updateData.read = read === true || read === 'true';
        if (updateData.read) {
          updateData.readAt = new Date();
        }
      }

      const message = await Message.findOneAndUpdate(
        { _id: messageId, recipient: session.user.id },
        updateData,
        { new: true }
      )
        .populate('sender', 'name email')
        .populate('recipient', 'name email');

      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      return res.status(200).json({ message });
    } catch (error: any) {
      console.error('Update message error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}





