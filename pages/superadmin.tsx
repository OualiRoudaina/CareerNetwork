import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Alert from '@/components/Alert';
import { IJob } from '@/models/Job';

interface Stats {
  users: {
    total: number;
    candidates: number;
    recruiters: number;
    admins: number;
    newLast7Days: number;
  };
  jobs: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    active: number;
    newLast7Days: number;
  };
  applications: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    newLast7Days: number;
  };
  monthlyStats: Array<{
    month: string;
    users: number;
    jobs: number;
    applications: number;
  }>;
  topCompanies: Array<{
    _id: string;
    count: number;
  }>;
  topSkills: Array<{
    _id: string;
    count: number;
  }>;
}

export default function SuperAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'jobs' | 'users'>('stats');
  const [users, setUsers] = useState<any[]>([]);
  const [jobStatusFilter, setJobStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user.role !== 'superadmin')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && session.user.role === 'superadmin') {
      fetchData();
    }
  }, [session, activeTab, jobStatusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const response = await fetch('/api/superadmin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } else if (activeTab === 'jobs') {
        const statusParam = jobStatusFilter === 'all' ? '' : jobStatusFilter;
        const response = await fetch(`/api/superadmin/jobs${statusParam ? `?status=${statusParam}` : ''}`);
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
          console.log('Jobs loaded:', data.jobs?.length || 0, 'with filter:', jobStatusFilter);
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Error loading jobs:', errorData);
          setAlert({ message: errorData.message || 'Erreur lors du chargement des offres', type: 'error' });
          setJobs([]);
        }
      } else if (activeTab === 'users') {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveJob = async (jobId: string) => {
    try {
      const response = await fetch('/api/superadmin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action: 'approve' }),
      });

      if (response.ok) {
        setAlert({ message: 'Offre approuvée avec succès', type: 'success' });
        fetchData();
      } else {
        const data = await response.json();
        setAlert({ message: data.message || 'Erreur lors de l\'approbation', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  const handleRejectJob = async (jobId: string) => {
    const reason = rejectReason[jobId] || '';
    if (!reason.trim()) {
      setAlert({ message: 'Veuillez fournir une raison de rejet', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/superadmin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action: 'reject', rejectionReason: reason }),
      });

      if (response.ok) {
        setAlert({ message: 'Offre rejetée avec succès', type: 'success' });
        setShowRejectModal(null);
        setRejectReason({ ...rejectReason, [jobId]: '' });
        fetchData();
      } else {
        const data = await response.json();
        setAlert({ message: data.message || 'Erreur lors du rejet', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  if (status === 'loading' || loading) {
    return <Loader />;
  }

  if (!session || session.user.role !== 'superadmin') {
    return null;
  }

  return (
    <>
      <Head>
        <title>Super Admin - CareerNetwork</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Super Admin Dashboard
            </h1>

            {alert && (
              <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert(null)}
              />
            )}

            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'stats'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                  }`}
                >
                  Statistiques
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'jobs'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                  }`}
                >
                  Gestion des Offres ({jobs.filter(j => j.status === 'pending').length})
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                  }`}
                >
                  Utilisateurs ({users.length})
                </button>
              </nav>
            </div>

            {activeTab === 'stats' && stats && (
              <div className="space-y-6">
                {/* Cartes de statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Total Utilisateurs
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.users.total}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      +{stats.users.newLast7Days} cette semaine
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Offres d'Emploi
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.jobs.total}
                    </p>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="text-yellow-600 dark:text-yellow-400">
                        {stats.jobs.pending} en attente
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        {stats.jobs.approved} approuvées
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Candidatures
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.applications.total}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      {stats.applications.pending} en attente
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Offres Actives
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.jobs.active}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Actuellement publiées
                    </p>
                  </div>
                </div>

                {/* Détails des utilisateurs */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Répartition des Utilisateurs
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Candidats</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.users.candidates}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Recruteurs</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.users.recruiters}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.users.admins}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistiques mensuelles */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Statistiques Mensuelles (6 derniers mois)
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Mois
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Utilisateurs
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Offres
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Candidatures
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {stats.monthlyStats.map((month, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {month.month}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {month.users}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {month.jobs}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {month.applications}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top entreprises et compétences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Top 10 Entreprises
                    </h2>
                    <ul className="space-y-2">
                      {stats.topCompanies.map((company, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">{company._id}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {company.count} offres
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Top 10 Compétences
                    </h2>
                    <ul className="space-y-2">
                      {stats.topSkills.map((skill, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">{skill._id}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {skill.count} offres
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="space-y-6">
                {/* Filtres */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setJobStatusFilter('all')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        jobStatusFilter === 'all'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Toutes ({jobs.length})
                    </button>
                    <button
                      onClick={() => setJobStatusFilter('pending')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        jobStatusFilter === 'pending'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      En Attente ({jobs.filter(j => j.status === 'pending').length})
                    </button>
                    <button
                      onClick={() => setJobStatusFilter('approved')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        jobStatusFilter === 'approved'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Approuvées ({jobs.filter(j => j.status === 'approved').length})
                    </button>
                    <button
                      onClick={() => setJobStatusFilter('rejected')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        jobStatusFilter === 'rejected'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Rejetées ({jobs.filter(j => j.status === 'rejected').length})
                    </button>
                  </div>
                </div>

                {/* Liste des offres */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Titre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Entreprise
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Lieu
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Publié par
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {jobs.map((job) => (
                          <tr key={job._id.toString()}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {job.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {job.company}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {job.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {(job.postedBy as any)?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                job.status === 'approved'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : job.status === 'rejected'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {job.status === 'approved' ? 'Approuvée' : job.status === 'rejected' ? 'Rejetée' : 'En attente'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                              {job.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleApproveJob(job._id.toString())}
                                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 font-medium mr-2"
                                  >
                                    Approuver
                                  </button>
                                  <button
                                    onClick={() => setShowRejectModal(job._id.toString())}
                                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 font-medium"
                                  >
                                    Rejeter
                                  </button>
                                </>
                              ) : job.status === 'rejected' && job.rejectionReason ? (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Raison: {job.rejectionReason}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {job.status === 'approved' ? 'Approuvée' : 'N/A'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {jobs.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Aucune offre trouvée
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Compétences
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user._id.toString()}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'superadmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.userType}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {user.profile?.skills?.length || 0} compétences
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={async () => {
                                if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
                                  return;
                                }
                                try {
                                  const response = await fetch(`/api/admin/users?id=${user._id}`, {
                                    method: 'DELETE',
                                  });
                                  if (response.ok) {
                                    setAlert({ message: 'Utilisateur supprimé', type: 'success' });
                                    fetchData();
                                  } else {
                                    setAlert({ message: 'Erreur lors de la suppression', type: 'error' });
                                  }
                                } catch (error) {
                                  setAlert({ message: 'Erreur de connexion', type: 'error' });
                                }
                              }}
                              className="text-red-600 hover:text-red-800 dark:text-red-400"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Aucun utilisateur trouvé
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal de rejet */}
            {showRejectModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Rejeter l'offre
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Veuillez fournir une raison de rejet :
                  </p>
                  <textarea
                    value={rejectReason[showRejectModal] || ''}
                    onChange={(e) => setRejectReason({ ...rejectReason, [showRejectModal]: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white mb-4"
                    rows={4}
                    placeholder="Raison du rejet..."
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleRejectJob(showRejectModal)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Rejeter
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectModal(null);
                        setRejectReason({ ...rejectReason, [showRejectModal]: '' });
                      }}
                      className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

