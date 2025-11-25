import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import { IApplication } from '@/models/Application';

export default function Applications() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchApplications();
    }
  }, [session]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
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

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {session.user.userType === 'candidate' ? 'Mes candidatures' : 'Candidatures reçues'} - CareerNetwork
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              {session.user.userType === 'candidate' ? 'Mes candidatures' : 'Candidatures reçues'}
            </h1>

            {applications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {session.user.userType === 'candidate'
                    ? "Vous n'avez pas encore postulé à une offre"
                    : "Vous n'avez pas encore reçu de candidatures"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application: any) => (
                  <div
                    key={application._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {session.user.userType === 'candidate' ? (
                          <>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {application.job?.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                              {application.job?.company} - {application.job?.location}
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {application.candidate?.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">
                              {application.candidate?.email}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              Pour: {application.job?.title} - {application.job?.company}
                            </p>
                          </>
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
                    {session.user.userType === 'recruiter' && application.status === 'pending' && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/applications/${application._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'accepted' }),
                              });
                              if (response.ok) {
                                fetchApplications();
                              }
                            } catch (error) {
                              console.error('Error updating application:', error);
                            }
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/applications/${application._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'rejected' }),
                              });
                              if (response.ok) {
                                fetchApplications();
                              }
                            } catch (error) {
                              console.error('Error updating application:', error);
                            }
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Refuser
                        </button>
                      </div>
                    )}
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



