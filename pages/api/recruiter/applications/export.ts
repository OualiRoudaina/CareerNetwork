import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';
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
      const { jobId, format = 'csv' } = req.query;

      // Récupérer les candidatures
      let query: any = { recruiter: session.user.id };
      if (jobId) {
        query.job = jobId;
      }

      const applications = await Application.find(query)
        .populate('job', 'title company location')
        .populate('candidate', 'name email profile')
        .sort({ createdAt: -1 });

      if (format === 'csv') {
        // Générer CSV
        const headers = [
          'Date de candidature',
          'Candidat',
          'Email',
          'Téléphone',
          'Offre',
          'Entreprise',
          'Lieu',
          'Statut',
          'Statut personnalisé',
          'Lettre de motivation',
        ];

        const rows = applications.map((app: any) => [
          new Date(app.createdAt).toLocaleDateString('fr-FR'),
          app.candidate?.name || '',
          app.candidate?.email || '',
          app.candidate?.profile?.phone || '',
          app.job?.title || '',
          app.job?.company || '',
          app.job?.location || '',
          app.status,
          app.customStatus || '',
          (app.coverLetter || '').replace(/\n/g, ' ').replace(/,/g, ';'),
        ]);

        const csvContent = [headers, ...rows]
          .map((row) => row.map((cell) => `"${cell}"`).join(','))
          .join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="candidatures_${Date.now()}.csv"`);
        return res.status(200).send('\ufeff' + csvContent); // BOM pour Excel
      } else if (format === 'pdf') {
        // Retourner les données pour génération PDF côté client
        // Le PDF sera généré côté client avec jsPDF pour de meilleures performances
        return res.status(200).json({
          applications: applications.map((app: any) => ({
            date: new Date(app.createdAt).toLocaleDateString('fr-FR'),
            candidate: {
              name: app.candidate?.name || '',
              email: app.candidate?.email || '',
              phone: app.candidate?.profile?.phone || '',
            },
            job: {
              title: app.job?.title || '',
              company: app.job?.company || '',
              location: app.job?.location || '',
            },
            status: app.status,
            customStatus: app.customStatus || '',
            coverLetter: app.coverLetter || '',
          })),
        });
      } else {
        // Format JSON
        return res.status(200).json({ applications });
      }
    } catch (error: any) {
      console.error('Export applications error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}



