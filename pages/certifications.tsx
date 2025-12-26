import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Alert from '@/components/Alert';

interface Certification {
  title: string;
  description: string;
  provider?: string;
  level?: string;
  skills_covered?: string[];
  score: number;
  relevance_explanation?: string;
}

export default function Certifications() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skillGap, setSkillGap] = useState<string[]>([]);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [targetJobRole, setTargetJobRole] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleGetRecommendations = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch('/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_job_role: targetJobRole || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCertifications(data.certifications || []);
        setSkillGap(data.skillGap || []);
        setAlert({
          message: data.certifications?.length > 0
            ? `✨ ${data.certifications.length} certifications recommandées !`
            : 'Aucune certification trouvée. Essayez avec un rôle cible différent.',
          type: data.certifications?.length > 0 ? 'success' : 'error',
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

  if (status === 'loading' || loading) {
    return <Loader />;
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Recommandations de Certifications - CareerNetwork</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-3xl p-12 mb-12 shadow-2xl relative overflow-hidden">
              <div className="relative text-center">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-6xl">🎓</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Recommandations de Certifications
                </h1>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Découvrez les certifications et formations qui combleront vos lacunes en compétences
                  et vous aideront à atteindre vos objectifs professionnels.
                </p>
                
                {/* Target Job Role Input */}
                <div className="max-w-md mx-auto mb-6">
                  <input
                    type="text"
                    value={targetJobRole}
                    onChange={(e) => setTargetJobRole(e.target.value)}
                    placeholder="Rôle cible (ex: Data Scientist, Full Stack Developer)"
                    className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-md text-white placeholder-white/70 focus:outline-none focus:border-white/50"
                  />
                  <p className="text-white/70 text-sm mt-2">Optionnel : Spécifiez un rôle pour des recommandations plus ciblées</p>
                </div>

                <button
                  onClick={handleGetRecommendations}
                  disabled={loading}
                  className="group relative inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <span className="relative z-10">✨ Trouver mes certifications</span>
                      <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>

            {alert && (
              <div className="mb-8">
                <Alert
                  message={alert.message}
                  type={alert.type}
                  onClose={() => setAlert(null)}
                />
              </div>
            )}

            {/* Skill Gap */}
            {skillGap.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Compétences à développer
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillGap.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-3">
                  Les certifications ci-dessous vous aideront à acquérir ces compétences.
                </p>
              </div>
            )}

            {/* Certifications List */}
            {certifications.length > 0 && (
              <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="w-10 h-10 bg-gradient-to-br from-purple-800 to-blue-800 rounded-xl flex items-center justify-center text-white mr-3">
                    🎓
                  </span>
                  Certifications Recommandées
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-100 dark:border-gray-700 hover:-translate-y-2"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {cert.title}
                          </h3>
                          {cert.provider && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Par {cert.provider}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                            {cert.score.toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">Pertinence</div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {cert.description}
                      </p>

                      {/* Skills Covered */}
                      {cert.skills_covered && cert.skills_covered.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wide">
                            Compétences couvertes
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {cert.skills_covered.slice(0, 5).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {cert.skills_covered.length > 5 && (
                              <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                +{cert.skills_covered.length - 5}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      {cert.relevance_explanation && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                            💡 {cert.relevance_explanation}
                          </p>
                        </div>
                      )}

                      {/* Level Badge */}
                      {cert.level && (
                        <div className="mt-4">
                          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                            Niveau: {cert.level}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && certifications.length === 0 && !alert && (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-6xl">🎓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Découvrez vos certifications idéales
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto mb-8">
                  Cliquez sur le bouton ci-dessus pour recevoir des recommandations personnalisées
                  basées sur votre profil et vos objectifs professionnels.
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

