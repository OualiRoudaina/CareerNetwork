import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Alert from './Alert';

interface ProfileFormProps {
  initialData?: any;
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    skills: initialData?.profile?.skills?.join(', ') || '',
    education: initialData?.profile?.education || [],
    experience: initialData?.profile?.experience || [],
    cvUrl: initialData?.profile?.cvUrl || '',
  });

  const [newEducation, setNewEducation] = useState({ degree: '', school: '', year: '' });
  const [newExperience, setNewExperience] = useState({ title: '', company: '', duration: '', description: '' });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        skills: initialData.profile?.skills?.join(', ') || '',
        education: initialData.profile?.education || [],
        experience: initialData.profile?.experience || [],
        cvUrl: initialData.profile?.cvUrl || '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: skillsArray,
          education: formData.education,
          experience: formData.experience,
          cvUrl: formData.cvUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ message: 'Profil mis à jour avec succès', type: 'success' });
      } else {
        setAlert({ message: data.message || 'Erreur lors de la mise à jour', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Erreur de connexion', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.school && newEducation.year) {
      setFormData({
        ...formData,
        education: [...formData.education, { ...newEducation, year: parseInt(newEducation.year) }],
      });
      setNewEducation({ degree: '', school: '', year: '' });
    }
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.company && newExperience.duration) {
      setFormData({
        ...formData,
        experience: [...formData.experience, newExperience],
      });
      setNewExperience({ title: '', company: '', duration: '', description: '' });
    }
  };

  const removeExperience = (index: number) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Compétences (séparées par des virgules)
        </label>
        <input
          type="text"
          id="skills"
          value={formData.skills}
          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          placeholder="Ex: JavaScript, React, Node.js, Python"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="cvUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          URL du CV (optionnel)
        </label>
        <input
          type="url"
          id="cvUrl"
          value={formData.cvUrl}
          onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
          placeholder="https://example.com/cv.pdf"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Formation
        </label>
        <div className="space-y-2 mb-4">
          {formData.education.map((edu: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded">
              <div>
                <span className="font-medium">{edu.degree}</span> - {edu.school} ({edu.year})
              </div>
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Diplôme"
            value={newEducation.degree}
            onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <input
            type="text"
            placeholder="École"
            value={newEducation.school}
            onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Année"
              value={newEducation.year}
              onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <button
              type="button"
              onClick={addEducation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Expérience professionnelle
        </label>
        <div className="space-y-2 mb-4">
          {formData.experience.map((exp: any, index: number) => (
            <div key={index} className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">{exp.title}</span> chez {exp.company} ({exp.duration})
                </div>
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </div>
              {exp.description && <p className="text-sm text-gray-600 dark:text-gray-400">{exp.description}</p>}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Poste"
              value={newExperience.title}
              onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <input
              type="text"
              placeholder="Entreprise"
              value={newExperience.company}
              onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <input
              type="text"
              placeholder="Durée"
              value={newExperience.duration}
              onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <textarea
            placeholder="Description"
            value={newExperience.description}
            onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            rows={2}
          />
          <button
            type="button"
            onClick={addExperience}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ajouter une expérience
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Enregistrement...' : 'Enregistrer le profil'}
      </button>
    </form>
  );
}

