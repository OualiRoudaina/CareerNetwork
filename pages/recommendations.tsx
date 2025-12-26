/*import { useState } from 'react';
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
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
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
*/


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
          message: `✨ ${data.jobs.length} offres recommandées trouvées !`,
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
        <main className="flex-grow pt-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-emerald-900 rounded-3xl p-12 mb-12 shadow-2xl relative overflow-hidden animate-fadeIn premium-glow">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              
              <div className="relative text-center">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                  <span className="text-6xl">🤖</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Recommandations Intelligentes
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Notre IA analyse votre profil et vous propose les offres d'emploi
                  les plus pertinentes basées sur vos compétences, formations et expériences.
                </p>
                <button
                  onClick={handleGetRecommendations}
                  disabled={loading}
                  className="group relative inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">✨ Trouver mes offres idéales</span>
                      <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-emerald-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left">
                    <div className="text-3xl mb-3">🎯</div>
                    <h3 className="text-lg font-bold text-white mb-2">Matching précis</h3>
                    <p className="text-white/80 text-sm">Offres parfaitement adaptées à votre profil</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left">
                    <div className="text-3xl mb-3">⚡</div>
                    <h3 className="text-lg font-bold text-white mb-2">Résultats instantanés</h3>
                    <p className="text-white/80 text-sm">Analyse ultra-rapide de votre profil</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-left">
                    <div className="text-3xl mb-3">📈</div>
                    <h3 className="text-lg font-bold text-white mb-2">Évolution continue</h3>
                    <p className="text-white/80 text-sm">IA qui apprend de vos préférences</p>
                  </div>
                </div>
              </div>
            </div>

            {alert && (
              <div className="mb-8 animate-fadeIn">
                <Alert
                  message={alert.message}
                  type={alert.type}
                  onClose={() => setAlert(null)}
                />
              </div>
            )}

            {loading && (
              <div className="flex flex-col justify-center items-center py-20 animate-fadeIn">
                <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-blue-200 dark:border-blue-900 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-16 border-4 border-green-200 dark:border-green-900 rounded-full animate-spin border-t-green-600 dark:border-t-green-400" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Analyse de votre profil en cours...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  L'IA recherche les meilleures opportunités pour vous
                </p>
              </div>
            )}

            {!loading && jobs.length > 0 && (
              <div className="animate-fadeIn">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center">
                    <span className="w-10 h-10 bg-gradient-to-br from-indigo-800 to-emerald-800 rounded-xl flex items-center justify-center text-white mr-3 premium-glow">
                      ✨
                    </span>
                    Offres recommandées pour vous
                  </h2>
                  <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-emerald-100 dark:from-indigo-900/30 dark:to-emerald-900/30 text-indigo-700 dark:text-indigo-300 rounded-full font-bold text-sm">
                    {jobs.length} offre{jobs.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job, index) => (
                    <div key={String(job._id)} className="animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && jobs.length === 0 && !alert && (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-lg animate-fadeIn border border-gray-100 dark:border-gray-700">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-emerald-100 dark:from-indigo-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Prêt à découvrir vos opportunités ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto mb-8">
                  Cliquez sur le bouton ci-dessus pour recevoir vos recommandations personnalisées
                </p>
                <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    100% Gratuit
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    Résultats instantanés
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
