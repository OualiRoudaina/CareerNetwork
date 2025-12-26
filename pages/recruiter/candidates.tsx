import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Alert from '@/components/Alert';

export default function CandidateSearch() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [filters, setFilters] = useState({
    skills: '',
    location: '',
    experience: false,
    education: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user.userType !== 'recruiter') {
      router.push('/');
    }
  }, [status, session, router]);

  const handleSearch = async () => {
    setLoading(true);
    setAlert(null);

    try {
      const params = new URLSearchParams();
      if (filters.skills) params.append('skills', filters.skills);
      if (filters.location) params.append('location', filters.location);
      if (filters.experience) params.append('experience', 'true');
      if (filters.education) params.append('education', 'true');

      const response = await fetch(`/api/recruiter/candidates/search?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
        if (data.candidates.length === 0) {
          setAlert({ message: 'Aucun candidat trouvé', type: 'error' });
        }
      } else {
        const data = await response.json();
        setAlert({ message: data.message || 'Erreur', type: 'error' });
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

  if (!session || session.user.userType !== 'recruiter') {
    return null;
  }

  return (
    <>
      <Head>
        <title>Recherche de candidats - CareerNetwork</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => router.push('/recruiter/dashboard')}
              className="mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              ← Retour au tableau de bord
            </button>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Recherche de candidats
            </h1>

            {alert && (
              <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert(null)}
              />
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Filtres de recherche
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Compétences (séparées par des virgules)
                  </label>
                  <input
                    type="text"
                    value={filters.skills}
                    onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                    placeholder="JavaScript, React, Node.js"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    placeholder="Paris, France"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.experience}
                      onChange={(e) => setFilters({ ...filters, experience: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Avec expérience</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.education}
                      onChange={(e) => setFilters({ ...filters, education: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Avec formation</span>
                  </label>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
            </div>

            {candidates.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Résultats ({candidates.length})
                </h2>
                {candidates.map((candidate) => (
                  <div
                    key={candidate._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {candidate.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">{candidate.email}</p>
                        {candidate.location && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            📍 {candidate.location}
                          </p>
                        )}
                        {candidate.skills.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Compétences:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {candidate.skills.map((skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {candidate.experience.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Expérience:
                            </p>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                              {candidate.experience.slice(0, 3).map((exp: any, idx: number) => (
                                <li key={idx}>
                                  {exp.title} chez {exp.company}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => router.push(`/profile/view/${candidate._id}`)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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







