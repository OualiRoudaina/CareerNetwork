import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Alert from '@/components/Alert';
import { IJob } from '@/models/Job';

export default function JobDetails() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  const [job, setJob] = useState<IJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (id) {
      fetchJob();
      checkApplication();
    }
  }, [id, session]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
      } else {
        router.push('/jobs');
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    if (!session || !id) return;
    try {
      const response = await fetch(`/api/applications?jobId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setHasApplied(data.applications.length > 0);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const handleApply = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user.userType !== 'candidate') {
      setAlert({ message: 'Seuls les candidats peuvent postuler', type: 'error' });
      return;
    }

    setApplying(true);
    setAlert(null);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: id,
          coverLetter,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ message: 'Candidature envoyée avec succès !', type: 'success' });
        setHasApplied(true);
        setShowApplicationForm(false);
        setCoverLetter('');
      } else {
        setAlert({ message: data.message || 'Erreur lors de la candidature', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Erreur de connexion', type: 'error' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!job) {
    return null;
  }

  const formatSalary = () => {
    if (!job.salary) return null;
    const { min, max, currency = 'EUR' } = job.salary;
    if (min && max) {
      return `${min}€ - ${max}€`;
    }
    if (min) {
      return `À partir de ${min}€`;
    }
    return null;
  };

  return (
    <>
      <Head>
        <title>{job.title} - CareerNetwork</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.back()}
              className="mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              ← Retour aux offres
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {job.title}
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300">{job.company}</p>
                </div>
                <span className="px-4 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {job.type}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{job.experience}</span>
                </div>
                {formatSalary() && (
                  <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatSalary()}</span>
                  </div>
                )}
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Compétences requises
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Prérequis
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {alert && (
                <Alert
                  message={alert.message}
                  type={alert.type}
                  onClose={() => setAlert(null)}
                />
              )}

              {session?.user.userType === 'candidate' && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {hasApplied ? (
                    <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-4 text-center">
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        ✓ Vous avez déjà postulé à cette offre
                      </p>
                    </div>
                  ) : (
                    <>
                      {!showApplicationForm ? (
                        <button
                          onClick={() => setShowApplicationForm(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition"
                        >
                          Postuler maintenant
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Lettre de motivation (optionnelle)
                            </label>
                            <textarea
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                              rows={5}
                              placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
                              className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleApply}
                              disabled={applying}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition disabled:opacity-50"
                            >
                              {applying ? 'Envoi...' : 'Envoyer ma candidature'}
                            </button>
                            <button
                              onClick={() => {
                                setShowApplicationForm(false);
                                setCoverLetter('');
                              }}
                              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {!session && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Connectez-vous pour postuler à cette offre
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition"
                  >
                    Se connecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

