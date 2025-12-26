import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
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
      const { skills, location, experience, education } = req.query;

      // Construire la requête
      let query: any = { userType: 'candidate' };

      // Recherche par compétences
      if (skills) {
        const skillsArray = (skills as string).split(',').map((s) => s.trim());
        query['profile.skills'] = { $in: skillsArray };
      }

      // Recherche par localisation
      if (location) {
        query['profile.location'] = { $regex: location as string, $options: 'i' };
      }

      // Recherche par expérience (dans le profil)
      if (experience) {
        query['profile.experience'] = { $exists: true, $ne: [] };
      }

      // Recherche par éducation
      if (education) {
        query['profile.education'] = { $exists: true, $ne: [] };
      }

      const candidates = await User.find(query)
        .select('name email profile')
        .limit(50);

      return res.status(200).json({
        candidates: candidates.map((c) => ({
          _id: c._id,
          name: c.name,
          email: c.email,
          skills: c.profile?.skills || [],
          location: c.profile?.city || c.profile?.country || '',
          experience: c.profile?.experience || [],
          education: c.profile?.education || [],
        })),
      });
    } catch (error: any) {
      console.error('Search candidates error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}







