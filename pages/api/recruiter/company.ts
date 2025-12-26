import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Company from '@/models/Company';
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
      const company = await Company.findOne({ recruiter: session.user.id });
      return res.status(200).json({ company });
    } catch (error: any) {
      console.error('Get company error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const { name, logo, description, website, industry, size, location, foundedYear } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Company name is required' });
      }

      let company = await Company.findOne({ recruiter: session.user.id });

      if (company) {
        // Mettre à jour
        company.name = name;
        if (logo !== undefined) company.logo = logo;
        if (description !== undefined) company.description = description;
        if (website !== undefined) company.website = website;
        if (industry !== undefined) company.industry = industry;
        if (size !== undefined) company.size = size;
        if (location !== undefined) company.location = location;
        if (foundedYear !== undefined) company.foundedYear = foundedYear;
        await company.save();
      } else {
        // Créer
        company = await Company.create({
          name,
          recruiter: session.user.id,
          logo,
          description,
          website,
          industry,
          size,
          location,
          foundedYear,
        });
      }

      return res.status(200).json({ message: 'Company updated', company });
    } catch (error: any) {
      console.error('Update company error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}







