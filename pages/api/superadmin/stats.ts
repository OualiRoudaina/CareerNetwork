import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Job from '@/models/Job';
import Application from '@/models/Application';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'superadmin') {
    return res.status(401).json({ message: 'Unauthorized - Super Admin only' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Statistiques des utilisateurs
      const totalUsers = await User.countDocuments();
      const totalCandidates = await User.countDocuments({ userType: 'candidate' });
      const totalRecruiters = await User.countDocuments({ userType: 'recruiter' });
      const totalAdmins = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });
      
      // Statistiques des offres
      const totalJobs = await Job.countDocuments();
      const pendingJobs = await Job.countDocuments({ status: 'pending' });
      const approvedJobs = await Job.countDocuments({ status: 'approved' });
      const rejectedJobs = await Job.countDocuments({ status: 'rejected' });
      const activeJobs = await Job.countDocuments({ isActive: true, status: 'approved' });
      
      // Statistiques des candidatures
      const totalApplications = await Application.countDocuments();
      const pendingApplications = await Application.countDocuments({ status: 'pending' });
      const acceptedApplications = await Application.countDocuments({ status: 'accepted' });
      const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
      
      // Statistiques par période (7 derniers jours)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const newUsersLast7Days = await User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      });
      const newJobsLast7Days = await Job.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      });
      const newApplicationsLast7Days = await Application.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      });
      
      // Statistiques par mois (6 derniers mois)
      const monthlyStats = [];
      for (let i = 5; i >= 0; i--) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - i);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        
        const usersInMonth = await User.countDocuments({
          createdAt: { $gte: startDate, $lt: endDate }
        });
        const jobsInMonth = await Job.countDocuments({
          createdAt: { $gte: startDate, $lt: endDate }
        });
        const applicationsInMonth = await Application.countDocuments({
          createdAt: { $gte: startDate, $lt: endDate }
        });
        
        monthlyStats.push({
          month: startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          users: usersInMonth,
          jobs: jobsInMonth,
          applications: applicationsInMonth,
        });
      }
      
      // Top entreprises par nombre d'offres
      const topCompanies = await Job.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$company', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      // Top compétences demandées
      const topSkills = await Job.aggregate([
        { $match: { status: 'approved' } },
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return res.status(200).json({
        users: {
          total: totalUsers,
          candidates: totalCandidates,
          recruiters: totalRecruiters,
          admins: totalAdmins,
          newLast7Days: newUsersLast7Days,
        },
        jobs: {
          total: totalJobs,
          pending: pendingJobs,
          approved: approvedJobs,
          rejected: rejectedJobs,
          active: activeJobs,
          newLast7Days: newJobsLast7Days,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications,
          newLast7Days: newApplicationsLast7Days,
        },
        monthlyStats,
        topCompanies,
        topSkills,
      });
    } catch (error: any) {
      console.error('Get stats error:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

