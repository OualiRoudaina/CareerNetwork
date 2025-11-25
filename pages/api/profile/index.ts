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

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const user = await User.findById(session.user.id).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ profile: user.profile, name: user.name });
    } catch (error: any) {
      console.error('Get profile error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const {
        name,
        phone,
        address,
        city,
        country,
        postalCode,
        photoUrl,
        summary,
        skills,
        education,
        experience,
        languages,
        certifications,
        projects,
        cvUrl,
      } = req.body;

      const updateData: any = {};

      if (name) updateData.name = name;
      if (phone !== undefined) updateData['profile.phone'] = phone;
      if (address !== undefined) updateData['profile.address'] = address;
      if (city !== undefined) updateData['profile.city'] = city;
      if (country !== undefined) updateData['profile.country'] = country;
      if (postalCode !== undefined) updateData['profile.postalCode'] = postalCode;
      if (photoUrl !== undefined) updateData['profile.photoUrl'] = photoUrl;
      if (summary !== undefined) updateData['profile.summary'] = summary;
      if (skills) updateData['profile.skills'] = skills;
      if (education) updateData['profile.education'] = education;
      if (experience) updateData['profile.experience'] = experience;
      if (languages) updateData['profile.languages'] = languages;
      if (certifications) updateData['profile.certifications'] = certifications;
      if (projects) updateData['profile.projects'] = projects;
      if (cvUrl !== undefined) updateData['profile.cvUrl'] = cvUrl;

      const user = await User.findByIdAndUpdate(
        session.user.id,
        { $set: updateData },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ message: 'Profile updated', profile: user.profile, name: user.name });
    } catch (error: any) {
      console.error('Update profile error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

