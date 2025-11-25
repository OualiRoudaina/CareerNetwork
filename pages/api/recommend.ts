import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Job from '@/models/Job';

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
    const user = await User.findById(session.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userSkills = user.profile.skills || [];
    const userEducation = user.profile.education || [];
    const userExperience = user.profile.experience || [];

    // Pour l'instant, logique de recommandation basique basée sur les compétences
    // Plus tard, cette partie sera remplacée par l'appel à l'API IA
    let query: any = { isActive: true };

    if (userSkills.length > 0) {
      query.skills = { $in: userSkills };
    }

    // Récupérer les jobs qui correspondent aux compétences
    let recommendedJobs = await Job.find(query).limit(10);

    // Si pas assez de résultats, élargir la recherche
    if (recommendedJobs.length < 5) {
      const titleKeywords = userSkills.join(' ');
      query = {
        isActive: true,
        $or: [
          { title: { $regex: titleKeywords, $options: 'i' } },
          { description: { $regex: titleKeywords, $options: 'i' } },
        ],
      };
      recommendedJobs = await Job.find(query).limit(10);
    }

    // TODO: Plus tard, remplacer cette logique par un appel à l'API IA
    // const aiResponse = await fetch(`${process.env.AI_API_URL}/api/recommend`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     skills: userSkills,
    //     education: userEducation,
    //     experience: userExperience,
    //   }),
    // });
    // const aiData = await aiResponse.json();
    // recommendedJobs = await Job.find({ _id: { $in: aiData.jobIds } });

    return res.status(200).json({
      message: 'Recommendations generated',
      jobs: recommendedJobs,
      profile: {
        skills: userSkills,
        education: userEducation,
        experience: userExperience,
      },
    });
  } catch (error: any) {
    console.error('Recommendation error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

