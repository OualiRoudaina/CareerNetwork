import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import Application from '@/models/Application';
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
      const recruiterId = session.user.id;

      // Récupérer toutes les offres du recruteur
      const jobs = await Job.find({ postedBy: recruiterId });

      // Statistiques globales
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter((j) => j.isActive).length;
      const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);

      // Récupérer toutes les candidatures pour ces offres
      const jobIds = jobs.map((j) => j._id);
      const applications = await Application.find({ job: { $in: jobIds } });

      const totalApplications = applications.length;
      const pendingApplications = applications.filter((a) => a.status === 'pending').length;
      const acceptedApplications = applications.filter((a) => a.status === 'accepted').length;
      const rejectedApplications = applications.filter((a) => a.status === 'rejected').length;
      const reviewedApplications = applications.filter((a) => a.status === 'reviewed').length;

      // Taux de conversion (candidatures / vues)
      const conversionRate = totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(2) : '0.00';

      // Statistiques par offre
      const jobsWithStats = await Promise.all(
        jobs.map(async (job) => {
          const jobApplications = applications.filter(
            (a) => a.job.toString() === job._id.toString()
          );
          return {
            jobId: job._id,
            title: job.title,
            views: job.views || 0,
            applications: jobApplications.length,
            conversionRate:
              job.views > 0
                ? ((jobApplications.length / job.views) * 100).toFixed(2)
                : '0.00',
          };
        })
      );

      // Statistiques par période (30 derniers jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentApplications = applications.filter(
        (a) => new Date(a.createdAt) >= thirtyDaysAgo
      );
      const recentJobs = jobs.filter((j) => new Date(j.createdAt) >= thirtyDaysAgo);

      return res.status(200).json({
        stats: {
          totalJobs,
          activeJobs,
          totalViews,
          totalApplications,
          pendingApplications,
          acceptedApplications,
          rejectedApplications,
          reviewedApplications,
          conversionRate: parseFloat(conversionRate),
        },
        recent: {
          applicationsLast30Days: recentApplications.length,
          jobsCreatedLast30Days: recentJobs.length,
        },
        jobsWithStats,
      });
    } catch (error: any) {
      console.error('Get recruiter stats error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}







