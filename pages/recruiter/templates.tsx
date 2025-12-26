import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Alert from '@/components/Alert';

export default function JobTemplates() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    requirements: '',
    skills: '',
    experience: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    salaryMin: '',
    salaryMax: '',
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
      fetchTemplates();
    }
  }, [session]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/recruiter/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    try {
      const response = await fetch('/api/recruiter/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements.split('\n').filter((r) => r.trim()),
          skills: formData.skills.split(',').map((s) => s.trim()).filter((s) => s),
          experience: formData.experience,
          type: formData.type,
          salary: {
            min: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
            max: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
            currency: 'EUR',
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ message: 'Template créé avec succès', type: 'success' });
        setShowForm(false);
        resetForm();
        fetchTemplates();
      } else {
        setAlert({ message: data.message || 'Erreur', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/recruiter/templates?id=${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAlert({ message: 'Template supprimé', type: 'success' });
        fetchTemplates();
      } else {
        setAlert({ message: 'Erreur lors de la suppression', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Erreur de connexion', type: 'error' });
    }
  };

  const handleUseTemplate = (template: any) => {
    router.push({
      pathname: '/recruiter/dashboard',
      query: { useTemplate: template._id },
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      description: '',
      requirements: '',
      skills: '',
      experience: '',
      type: 'full-time',
      salaryMin: '',
      salaryMax: '',
    });
    setEditingTemplate(null);
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
        <title>Templates d'offres - CareerNetwork</title>
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

            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Templates d'offres
              </h1>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  resetForm();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {showForm ? 'Annuler' : '+ Nouveau template'}
              </button>
            </div>

            {alert && (
              <Alert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert(null)}
              />
            )}

            {showForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Créer un template
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom du template *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Développeur Full Stack"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Titre du poste *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Exigences (une par ligne)
                    </label>
                    <textarea
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Compétences (séparées par des virgules)
                    </label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expérience requise *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type de contrat *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="full-time">Temps plein</option>
                        <option value="part-time">Temps partiel</option>
                        <option value="contract">Contrat</option>
                        <option value="internship">Stage</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Salaire min (EUR)
                      </label>
                      <input
                        type="number"
                        value={formData.salaryMin}
                        onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Salaire max (EUR)
                      </label>
                      <input
                        type="number"
                        value={formData.salaryMax}
                        onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Créer le template
                  </button>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {template.title}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Utiliser
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {templates.length === 0 && !showForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Aucun template créé. Créez votre premier template pour gagner du temps lors de la création d'offres.
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







