import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import { IApplication } from '@/models/Application';

export default function JobApplications() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { id } = router.query;
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user.userType !== 'recruiter')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (id && session) {
      fetchData();
    }
  }, [id, session]);

  const fetchData = async () => {
    try {
      const [jobResponse, applicationsResponse] = await Promise.all([
        fetch(`/api/jobs/${id}`),
        fetch(`/api/applications?jobId=${id}`),
      ]);

      if (jobResponse.ok) {
        const jobData = await jobResponse.json();
        setJob(jobData.job);
      }

      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData.applications);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      case 'reviewed':
        return 'En cours d\'examen';
      default:
        return 'En attente';
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
        <title>Candidatures - {job?.title} - CareerNetwork</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => router.push('/recruiter/dashboard')}
              className="mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              ← Retour au tableau de bord
            </button>

            {job && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {job.company} - {job.location}
                </p>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Candidatures ({applications.length})
            </h2>

            {applications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Aucune candidature pour cette offre pour le moment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application: any) => (
                  <div
                    key={application._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {application.candidate?.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {application.candidate?.email}
                        </p>
                        {application.candidate?.profile?.phone && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Téléphone: {application.candidate.profile.phone}
                          </p>
                        )}
                        {application.coverLetter && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Lettre de motivation:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                              {application.coverLetter}
                            </p>
                          </div>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                          Postulé le: {new Date(application.appliedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {getStatusLabel(application.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'accepted')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Refuser
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application._id, 'reviewed')}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                          >
                            Marquer comme examiné
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => router.push(`/profile/view/${application.candidate?._id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Voir le profil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}



