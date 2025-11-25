import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  try {
    const user = await User.findById(session.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Préparer les données pour la génération PDF côté client
    const pdfData = {
      name: user.name,
      email: user.email,
      phone: user.profile?.phone || '',
      address: [
        user.profile?.address,
        user.profile?.city,
        user.profile?.postalCode,
        user.profile?.country,
      ]
        .filter(Boolean)
        .join(', '),
      summary: user.profile?.summary || '',
      skills: user.profile?.skills || [],
      education: user.profile?.education || [],
      experience: user.profile?.experience || [],
      languages: user.profile?.languages || [],
      certifications: user.profile?.certifications || [],
      projects: user.profile?.projects || [],
    };

    // Retourner les données structurées pour génération côté client
    return res.status(200).json({
      success: true,
      data: pdfData,
    });
  } catch (error: any) {
    console.error('Generate PDF error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

