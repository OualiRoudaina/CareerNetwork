import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Alert from '@/components/Alert';

export default function CompanyManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [company, setCompany] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    foundedYear: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user.userType !== 'recruiter') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && session.user.userType === 'recruiter') {
      fetchCompany();
    }
  }, [session]);

  const fetchCompany = async () => {
    try {
      const response = await fetch('/api/recruiter/company');
      if (response.ok) {
        const data = await response.json();
        if (data.company) {
          setCompany(data.company);
          setFormData({
            name: data.company.name || '',
            logo: data.company.logo || '',
            description: data.company.description || '',
            website: data.company.website || '',
            industry: data.company.industry || '',
            size: data.company.size || '',
            location: data.company.location || '',
            foundedYear: data.company.foundedYear?.toString() || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const response = await fetch('/api/recruiter/company', {
        method: company ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ message: 'Entreprise mise à jour avec succès', type: 'success' });
        fetchCompany();
      } else {
        setAlert({ message: data.message || 'Erreur', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Erreur de connexion', type: 'error' });
    } finally {
      setSaving(false);
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
        <title>Gestion d'entreprise - CareerNetwork</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.push('/recruiter/dashboard')}
              className="mb-6 text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              ← Retour au tableau de bord
            </button>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Gestion de mon entreprise
            </h1>

            {alert && (
              <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert(null)}
              />
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {formData.logo && (
                    <img src={formData.logo} alt="Logo" className="mt-2 h-20 object-contain" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Décrivez votre entreprise..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Site web
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Secteur d'activité
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="Technologie, Finance, etc."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Taille de l'entreprise
                    </label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Sélectionner</option>
                      <option value="1-10">1-10 employés</option>
                      <option value="11-50">11-50 employés</option>
                      <option value="51-200">51-200 employés</option>
                      <option value="201-500">201-500 employés</option>
                      <option value="501-1000">501-1000 employés</option>
                      <option value="1000+">1000+ employés</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Année de fondation
                    </label>
                    <input
                      type="number"
                      value={formData.foundedYear}
                      onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                      min="1800"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Paris, France"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/recruiter/dashboard')}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}







