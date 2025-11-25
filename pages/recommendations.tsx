import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';
import Loader from '@/components/Loader';
import Alert from '@/components/Alert';
import { IJob } from '@/models/Job';

export default function Recommendations() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleGetRecommendations = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs);
        setAlert({
          message: `${data.jobs.length} offres recommandées trouvées !`,
          type: 'success',
        });
      } else {
        setAlert({ message: data.message || 'Erreur lors de la génération des recommandations', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Erreur de connexion', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <Loader />;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <>
      <Head>
        <title>Recommandations IA - CareerNetwork</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Recommandations IA
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Trouvez vos offres idéales
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Notre intelligence artificielle analyse votre profil et vous propose les offres d'emploi
                  les plus pertinentes basées sur vos compétences, formations et expériences.
                </p>
                <button
                  onClick={handleGetRecommendations}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Analyse en cours...' : 'Trouver mes offres'}
                </button>
              </div>
            </div>

            {alert && (
              <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert(null)}
              />
            )}

            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader />
              </div>
            )}

            {!loading && jobs.length > 0 && (
              <>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Offres recommandées pour vous
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job) => (
                    <JobCard key={job._id.toString()} job={job} />
                  ))}
                </div>
              </>
            )}

            {!loading && jobs.length === 0 && !alert && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Cliquez sur "Trouver mes offres" pour recevoir vos recommandations personnalisées.
                </p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

