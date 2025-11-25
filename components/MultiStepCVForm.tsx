import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Alert from './Alert';

interface MultiStepCVFormProps {
  initialData?: any;
}

interface FormData {
  // Étape 1: Informations personnelles
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  photoUrl: string;
  summary: string;
  
  // Étape 2: Compétences
  skills: string[];
  
  // Étape 3: Éducation
  education: {
    degree: string;
    school: string;
    year: number;
    field: string;
    description: string;
  }[];
  
  // Étape 4: Expérience
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
    startDate: string;
    endDate: string;
    current: boolean;
  }[];
  
  // Étape 5: Langues
  languages: {
    name: string;
    level: string;
  }[];
  
  // Étape 6: Certifications & Projets
  certifications: {
    name: string;
    issuer: string;
    date: string;
    expiryDate: string;
  }[];
  
  projects: {
    name: string;
    description: string;
    technologies: string[];
    url: string;
  }[];
}

const STEPS = [
  'Informations personnelles',
  'Compétences',
  'Éducation',
  'Expérience professionnelle',
  'Langues',
  'Certifications & Projets',
];

export default function MultiStepCVForm({ initialData }: MultiStepCVFormProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    email: session?.user?.email || '',
    phone: initialData?.profile?.phone || '',
    address: initialData?.profile?.address || '',
    city: initialData?.profile?.city || '',
    country: initialData?.profile?.country || '',
    postalCode: initialData?.profile?.postalCode || '',
    photoUrl: initialData?.profile?.photoUrl || '',
    summary: initialData?.profile?.summary || '',
    skills: initialData?.profile?.skills || [],
    education: initialData?.profile?.education || [],
    experience: initialData?.profile?.experience || [],
    languages: initialData?.profile?.languages || [],
    certifications: initialData?.profile?.certifications || [],
    projects: initialData?.profile?.projects || [],
  });

  const [tempSkill, setTempSkill] = useState('');
  const [newEducation, setNewEducation] = useState({
    degree: '',
    school: '',
    year: new Date().getFullYear().toString(),
    field: '',
    description: '',
  });
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    duration: '',
    description: '',
    startDate: '',
    endDate: '',
    current: false,
  });
  const [newLanguage, setNewLanguage] = useState({ name: '', level: 'Intermédiaire' });
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
  });
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    technologies: '',
    url: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: session?.user?.email || '',
        phone: initialData.profile?.phone || '',
        address: initialData.profile?.address || '',
        city: initialData.profile?.city || '',
        country: initialData.profile?.country || '',
        postalCode: initialData.profile?.postalCode || '',
        photoUrl: initialData.profile?.photoUrl || '',
        summary: initialData.profile?.summary || '',
        skills: initialData.profile?.skills || [],
        education: initialData.profile?.education || [],
        experience: initialData.profile?.experience || [],
        languages: initialData.profile?.languages || [],
        certifications: initialData.profile?.certifications || [],
        projects: initialData.profile?.projects || [],
      });
    }
  }, [initialData, session]);

  const saveStep = async () => {
    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode,
          photoUrl: formData.photoUrl,
          summary: formData.summary,
          skills: formData.skills,
          education: formData.education,
          experience: formData.experience,
          languages: formData.languages,
          certifications: formData.certifications,
          projects: formData.projects,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ message: 'Données enregistrées avec succès', type: 'success' });
        setTimeout(() => setAlert(null), 3000);
      } else {
        setAlert({ message: data.message || 'Erreur lors de l\'enregistrement', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Erreur de connexion', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    setGeneratingPDF(true);
    setAlert(null);

    try {
      // D'abord sauvegarder les données
      await saveStep();

      // Récupérer les données depuis l'API
      const response = await fetch('/api/profile/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        
        // Importer et utiliser le générateur PDF côté client
        const { generateCVPDF } = await import('@/lib/pdfGenerator');
        
        const pdfData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: [
            formData.address,
            formData.city,
            formData.postalCode,
            formData.country,
          ]
            .filter(Boolean)
            .join(', '),
          summary: formData.summary,
          skills: formData.skills,
          education: formData.education,
          experience: formData.experience,
          languages: formData.languages,
          certifications: formData.certifications,
          projects: formData.projects,
        };

        const blob = await generateCVPDF(pdfData);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CV_${formData.name.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setAlert({ message: 'CV PDF généré avec succès !', type: 'success' });
      } else {
        const data = await response.json();
        setAlert({ message: data.message || 'Erreur lors de la génération du PDF', type: 'error' });
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      setAlert({ message: 'Erreur lors de la génération du PDF. Assurez-vous que toutes les données sont remplies.', type: 'error' });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addSkill = () => {
    if (tempSkill.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, tempSkill.trim()],
      });
      setTempSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.school && newEducation.year) {
      setFormData({
        ...formData,
        education: [
          ...formData.education,
          {
            ...newEducation,
            year: parseInt(newEducation.year),
          },
        ],
      });
      setNewEducation({
        degree: '',
        school: '',
        year: new Date().getFullYear().toString(),
        field: '',
        description: '',
      });
    }
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setFormData({
        ...formData,
        experience: [...formData.experience, newExperience],
      });
      setNewExperience({
        title: '',
        company: '',
        duration: '',
        description: '',
        startDate: '',
        endDate: '',
        current: false,
      });
    }
  };

  const removeExperience = (index: number) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index),
    });
  };

  const addLanguage = () => {
    if (newLanguage.name) {
      setFormData({
        ...formData,
        languages: [...formData.languages, newLanguage],
      });
      setNewLanguage({ name: '', level: 'Intermédiaire' });
    }
  };

  const removeLanguage = (index: number) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((_, i) => i !== index),
    });
  };

  const addCertification = () => {
    if (newCertification.name && newCertification.issuer) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification],
      });
      setNewCertification({ name: '', issuer: '', date: '', expiryDate: '' });
    }
  };

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index),
    });
  };

  const addProject = () => {
    if (newProject.name && newProject.description) {
      setFormData({
        ...formData,
        projects: [
          ...formData.projects,
          {
            ...newProject,
            technologies: newProject.technologies.split(',').map((t) => t.trim()).filter((t) => t),
          },
        ],
      });
      setNewProject({ name: '', description: '', technologies: '', url: '' });
    }
  };

  const removeProject = (index: number) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index),
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Informations personnelles
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL de la photo de profil
              </label>
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Résumé professionnel
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={4}
                placeholder="Décrivez votre profil professionnel en quelques lignes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        );

      case 1: // Compétences
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ajouter une compétence
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempSkill}
                  onChange={(e) => setTempSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Ex: JavaScript, React, Python..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Compétences ({formData.skills.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Éducation
        return (
          <div className="space-y-4">
            <div className="space-y-2 mb-4">
              {formData.education.map((edu, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded"
                >
                  <div>
                    <span className="font-medium">{edu.degree}</span> - {edu.school} ({edu.year})
                    {edu.field && <span className="text-sm text-gray-600 dark:text-gray-400"> - {edu.field}</span>}
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
            <div className="space-y-2 border-t pt-4">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Diplôme *"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="École/Université *"
                  value={newEducation.school}
                  onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Année *"
                  value={newEducation.year}
                  onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Domaine d'étude"
                  value={newEducation.field}
                  onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <textarea
                placeholder="Description (optionnel)"
                value={newEducation.description}
                onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                rows={2}
              />
              <button
                type="button"
                onClick={addEducation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ajouter une formation
              </button>
            </div>
          </div>
        );

      case 3: // Expérience
        return (
          <div className="space-y-4">
            <div className="space-y-2 mb-4">
              {formData.experience.map((exp, index) => (
                <div key={index} className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{exp.title}</span> chez {exp.company}
                      {exp.duration && <span className="text-sm text-gray-600 dark:text-gray-400"> ({exp.duration})</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t pt-4">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Poste *"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Entreprise *"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="date"
                  placeholder="Date de début"
                  value={newExperience.startDate}
                  onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="date"
                  placeholder="Date de fin"
                  value={newExperience.endDate}
                  onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                  disabled={newExperience.current}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50"
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newExperience.current}
                    onChange={(e) => setNewExperience({ ...newExperience, current: e.target.checked, endDate: '' })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Poste actuel</span>
                </label>
              </div>
              <input
                type="text"
                placeholder="Durée (ex: 2 ans)"
                value={newExperience.duration}
                onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <textarea
                placeholder="Description des responsabilités et réalisations"
                value={newExperience.description}
                onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                rows={3}
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
        );

      case 4: // Langues
        return (
          <div className="space-y-4">
            <div className="space-y-2 mb-4">
              {formData.languages.map((lang, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded"
                >
                  <div>
                    <span className="font-medium">{lang.name}</span> - {lang.level}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t pt-4">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Langue *"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <select
                  value={newLanguage.level}
                  onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option>Débutant</option>
                  <option>Intermédiaire</option>
                  <option>Avancé</option>
                  <option>Natif</option>
                </select>
              </div>
              <button
                type="button"
                onClick={addLanguage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ajouter une langue
              </button>
            </div>
          </div>
        );

      case 5: // Certifications & Projets
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Certifications</h3>
              <div className="space-y-2 mb-4">
                {formData.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded"
                  >
                    <div>
                      <span className="font-medium">{cert.name}</span> - {cert.issuer} ({cert.date})
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t pt-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nom de la certification *"
                    value={newCertification.name}
                    onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Organisme émetteur *"
                    value={newCertification.issuer}
                    onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    placeholder="Date d'obtention"
                    value={newCertification.date}
                    onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="date"
                    placeholder="Date d'expiration (optionnel)"
                    value={newCertification.expiryDate}
                    onChange={(e) => setNewCertification({ ...newCertification, expiryDate: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={addCertification}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ajouter une certification
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Projets</h3>
              <div className="space-y-2 mb-4">
                {formData.projects.map((project, index) => (
                  <div key={index} className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium">{project.name}</span>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:underline text-sm"
                          >
                            Voir le projet
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t pt-4">
                <input
                  type="text"
                  placeholder="Nom du projet *"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <textarea
                  placeholder="Description du projet *"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  rows={2}
                />
                <input
                  type="text"
                  placeholder="Technologies (séparées par des virgules)"
                  value={newProject.technologies}
                  onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="url"
                  placeholder="URL du projet (optionnel)"
                  value={newProject.url}
                  onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addProject}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ajouter un projet
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className={`flex-1 flex items-center ${index < STEPS.length - 1 ? 'mr-2' : ''}`}
            >
              <div className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {STEPS[currentStep]}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={saveStep}
            disabled={loading}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              onClick={generatePDF}
              disabled={generatingPDF}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {generatingPDF ? 'Génération...' : 'Générer le CV PDF'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

