import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
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
    const user = await User.findById(session.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { target_job_role } = req.body;

    const userSkills = user.profile.skills || [];
    const userEducation = user.profile.education || [];
    const userExperience = user.profile.experience || [];
    const userLanguages = user.profile.languages || [];
    const userCertifications = user.profile.certifications || [];

    // Préparer les données pour l'API IA
    const skillsText = Array.isArray(userSkills) ? userSkills.join(', ') : String(userSkills || '');
    const educationText = Array.isArray(userEducation) 
      ? userEducation.map((edu: any) => `${edu.degree || ''} ${edu.field || ''} ${edu.school || ''}`).join(', ')
      : String(userEducation || '');
    const experienceText = Array.isArray(userExperience)
      ? userExperience.map((exp: any) => `${exp.title || ''} ${exp.company || ''} ${exp.description || ''}`).join(', ')
      : String(userExperience || '');
    const languagesText = Array.isArray(userLanguages)
      ? userLanguages.map((lang: any) => `${lang.name || ''} ${lang.level || ''}`).join(', ')
      : String(userLanguages || '');
    const certificationsText = Array.isArray(userCertifications)
      ? userCertifications.map((cert: any) => `${cert.name || ''} ${cert.issuer || ''}`).join(', ')
      : String(userCertifications || '');
    const locationText = `${user.profile.city || ''} ${user.profile.country || ''}`.trim();

    // Appel à l'API IA pour les recommandations de certifications
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    let certifications: any[] = [];
    let skillGap: string[] = [];

    try {
      console.log('Calling ML service for certification recommendations...');
      
      const aiResponse = await fetch(`${mlServiceUrl}/api/recommend-certifications?top_n=10${target_job_role ? `&target_job_role=${encodeURIComponent(target_job_role)}` : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: skillsText,
          experience: experienceText,
          education: educationText,
          location: locationText,
          contract_type: '',
          languages: languagesText,
          certifications: certificationsText,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        certifications = aiData.recommendations || [];
        skillGap = aiData.skill_gap || [];
        
        console.log('ML Service returned', certifications.length, 'certification recommendations');
        console.log('Skill gap identified:', skillGap.length, 'skills');
      } else {
        console.warn('ML Service returned error:', aiResponse.status, aiResponse.statusText);
        const errorData = await aiResponse.json().catch(() => ({ detail: 'Unknown error' }));
        console.warn('Error details:', errorData);
      }
    } catch (error: any) {
      console.warn('ML Service unavailable for certifications:', error.message);
    }

    return res.status(200).json({
      message: certifications.length > 0 
        ? `Found ${certifications.length} certification recommendations` 
        : 'No certification recommendations available',
      certifications,
      skillGap,
      profile: {
        skills: userSkills,
        education: userEducation,
        experience: userExperience,
      },
    });
  } catch (error: any) {
    console.error('Certification recommendation error:', error);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
}

