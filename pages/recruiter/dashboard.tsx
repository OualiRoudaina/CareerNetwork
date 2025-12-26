import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Alert from '@/components/Alert';
import { IJob } from '@/models/Job';

export default function RecruiterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<IJob | null>(null);

  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    skills: '',
    experience: '',
    salaryMin: '',
    salaryMax: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user.userType !== 'recruiter') {
      router.push('/');
    }
  }, [status, session, router]);

  const [stats, setStats] = useState<any>(null);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  useEffect(() => {
    if (session && session.user.userType === 'recruiter') {
      fetchJobs();
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/recruiter/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/recruiter/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const url = editingJob ? `/api/jobs/${editingJob._id}` : '/api/jobs';
      const method = editingJob ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobForm.title,
          company: jobForm.company,
          location: jobForm.location,
          description: jobForm.description,
          requirements: jobForm.requirements.split('\n').filter((r) => r.trim()),
          skills: jobForm.skills.split(',').map((s) => s.trim()).filter((s) => s),
          experience: jobForm.experience,
          salary: {
            min: jobForm.salaryMin ? parseInt(jobForm.salaryMin) : undefined,
            max: jobForm.salaryMax ? parseInt(jobForm.salaryMax) : undefined,
            currency: 'EUR',
          },
          type: jobForm.type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ message: editingJob ? 'Offre mise à jour' : 'Offre créée avec succès', type: 'success' });
        setShowJobForm(false);
        setEditingJob(null);
        setJobForm({
          title: '',
          company: '',
          location: '',
          description: '',
          requirements: '',
          skills: '',
          experience: '',
          salaryMin: '',
          salaryMax: '',
          type: 'full-time',
        });
        fetchJobs();
      } else {
        setAlert({ message: data.message || 'Erreur', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Erreur de connexion', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job: IJob) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      requirements: job.requirements?.join('\n') || '',
      skills: job.skills?.join(', ') || '',
      experience: job.experience,
      salaryMin: job.salary?.min?.toString() || '',
      salaryMax: job.salary?.max?.toString() || '',
      type: job.type,
    });
    setShowJobForm(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAlert({ message: 'Offre supprimée', type: 'success' });
        fetchJobs();
      } else {
        setAlert({ message: 'Erreur lors de la suppression', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchJobs();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling job status:', error);
    }
  };

  const handleBatchAction = async (action: string) => {
    if (selectedJobs.length === 0) {
      setAlert({ message: 'Veuillez sélectionner au moins une offre', type: 'error' });
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir ${action} ${selectedJobs.length} offre(s) ?`)) {
      return;
    }

    try {
      const response = await fetch('/api/recruiter/jobs/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, jobIds: selectedJobs }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ message: data.message, type: 'success' });
        setSelectedJobs([]);
        fetchJobs();
        fetchStats();
      } else {
        setAlert({ message: data.message || 'Erreur', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  if (status === 'loading' || loading) {
    return <Loader />;
  }

  if (!session || session.user.userType !== 'recruiter') {
    return null;
  }

  return (
    <>
      <Head>
        <title>Tableau de bord Recruteur - CareerNetwork</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tableau de bord Recruteur
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/recruiter/company')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Mon entreprise
                </button>
                <button
                  onClick={() => router.push('/recruiter/templates')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Templates
                </button>
                <button
                  onClick={() => router.push('/recruiter/candidates')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Rechercher candidats
                </button>
                <button
                  onClick={() => {
                    setShowJobForm(!showJobForm);
                    setEditingJob(null);
                    setJobForm({
                      title: '',
                      company: '',
                      location: '',
                      description: '',
                      requirements: '',
                      skills: '',
                      experience: '',
                      salaryMin: '',
                      salaryMax: '',
                      type: 'full-time',
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {showJobForm ? 'Annuler' : '+ Nouvelle offre'}
                </button>
              </div>
            </div>

            {/* Statistiques */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total offres</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.stats.totalJobs}</p>
                      <p className="text-xs text-gray-500 mt-1">{stats.stats.activeJobs} actives</p>
                    </div>
                    <div className="text-blue-500 text-4xl">📋</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Vues totales</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.stats.totalViews}</p>
                    </div>
                    <div className="text-green-500 text-4xl">👁️</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Candidatures</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.stats.totalApplications}</p>
                      <p className="text-xs text-gray-500 mt-1">{stats.stats.pendingApplications} en attente</p>
                    </div>
                    <div className="text-purple-500 text-4xl">📝</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Taux de conversion</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.stats.conversionRate}%</p>
                    </div>
                    <div className="text-orange-500 text-4xl">📊</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Mes offres d'emploi
              </h2>
            </div>

            {alert && (
              <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert(null)}
              />
            )}

            {showJobForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {editingJob ? 'Modifier l\'offre' : 'Créer une nouvelle offre'}
                </h2>
                <form onSubmit={handleSubmitJob} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Titre du poste *
                      </label>
                      <input
                        type="text"
                        required
                        value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Entreprise *
                      </label>
                      <input
                        type="text"
                        required
                        value={jobForm.company}
                        onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lieu *
                      </label>
                      <input
                        type="text"
                        required
                        value={jobForm.location}
                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type de contrat *
                      </label>
                      <select
                        value={jobForm.type}
                        onChange={(e) => setJobForm({ ...jobForm, type: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="full-time">Temps plein</option>
                        <option value="part-time">Temps partiel</option>
                        <option value="contract">Contrat</option>
                        <option value="internship">Stage</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Exigences (une par ligne)
                    </label>
                    <textarea
                      value={jobForm.requirements}
                      onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Compétences requises (séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      value={jobForm.skills}
                      onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                      placeholder="JavaScript, React, Node.js"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expérience requise *
                      </label>
                      <input
                        type="text"
                        required
                        value={jobForm.experience}
                        onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                        placeholder="2-5 ans"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Salaire min (EUR)
                      </label>
                      <input
                        type="number"
                        value={jobForm.salaryMin}
                        onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Salaire max (EUR)
                      </label>
                      <input
                        type="number"
                        value={jobForm.salaryMax}
                        onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {editingJob ? 'Mettre à jour' : 'Créer l\'offre'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowJobForm(false);
                        setEditingJob(null);
                      }}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {selectedJobs.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    {selectedJobs.length} offre(s) sélectionnée(s)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBatchAction('activate')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Activer
                    </button>
                    <button
                      onClick={() => handleBatchAction('deactivate')}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Désactiver
                    </button>
                    <button
                      onClick={() => handleBatchAction('delete')}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                    <button
                      onClick={() => setSelectedJobs([])}
                      className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedJobs.length === jobs.length && jobs.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedJobs(jobs.map((j) => String(j._id)));
                              } else {
                                setSelectedJobs([]);
                              }
                            }}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Titre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Entreprise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Vues
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {jobs.map((job) => {
                      const jobId = String(job._id);
                      return (
                      <tr key={jobId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedJobs.includes(jobId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedJobs([...selectedJobs, jobId]);
                              } else {
                                setSelectedJobs(selectedJobs.filter((id) => id !== jobId));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {job.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {job.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {job.views || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => toggleJobStatus(jobId, job.isActive)}
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              job.isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {job.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleEdit(job)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => router.push(`/recruiter/jobs/${jobId}`)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400"
                          >
                            Candidatures
                          </button>
                          <button
                            onClick={() => handleDelete(jobId)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}



