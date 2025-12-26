/*import { useEffect, useState } from 'react';
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
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
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

*/


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
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return '✓';
      case 'rejected':
        return '✗';
      case 'reviewed':
        return '👁';
      default:
        return '⏳';
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

  const filteredApplications = filterStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  const getStatusCount = (status: string) => {
    if (status === 'all') return applications.length;
    return applications.filter(app => app.status === status).length;
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
        <main className="flex-grow pt-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-emerald-900 py-16 relative overflow-hidden premium-glow">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center animate-fadeIn">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl">
                    📋
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                  {session.user.userType === 'candidate' ? 'Mes candidatures' : 'Candidatures reçues'}
                </h1>
                <p className="text-xl text-white/90">
                  {applications.length} candidature{applications.length > 1 ? 's' : ''} au total
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 animate-fadeIn border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Filtrer par statut</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    filterStatus === 'all'
                      ? 'bg-gradient-to-r from-indigo-800 to-emerald-800 text-white shadow-xl scale-105 premium-glow'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="flex items-center">
                    Toutes
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {getStatusCount('all')}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    filterStatus === 'pending'
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="flex items-center">
                    ⏳ En attente
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {getStatusCount('pending')}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => setFilterStatus('reviewed')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    filterStatus === 'reviewed'
                      ? 'bg-yellow-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="flex items-center">
                    👁 En examen
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {getStatusCount('reviewed')}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => setFilterStatus('accepted')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    filterStatus === 'accepted'
                      ? 'bg-green-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="flex items-center">
                    ✓ Acceptées
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {getStatusCount('accepted')}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => setFilterStatus('rejected')}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    filterStatus === 'rejected'
                      ? 'bg-red-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="flex items-center">
                    ✗ Refusées
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {getStatusCount('rejected')}
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* Applications List */}
            {filteredApplications.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg animate-fadeIn border border-gray-100 dark:border-gray-700">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-emerald-100 dark:from-indigo-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {filterStatus === 'all' 
                    ? session.user.userType === 'candidate'
                      ? "Vous n'avez pas encore postulé"
                      : "Vous n'avez pas encore reçu de candidatures"
                    : `Aucune candidature ${getStatusLabel(filterStatus).toLowerCase()}`
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                  {session.user.userType === 'candidate'
                    ? "Explorez nos offres d'emploi et postulez dès maintenant"
                    : "Les candidatures apparaîtront ici dès qu'elles seront reçues"
                  }
                </p>
                {session.user.userType === 'candidate' && (
                  <button
                    onClick={() => router.push('/jobs')}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-800 to-emerald-800 text-white font-bold rounded-xl hover:from-indigo-900 hover:to-emerald-900 transition-all duration-300 hover:shadow-xl premium-glow"
                  >
                    Voir les offres
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application: any, index) => (
                  <div
                    key={application._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        {session.user.userType === 'candidate' ? (
                          <>
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {application.job?.title}
                              </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-3">
                              <span className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {application.job?.company}
                              </span>
                              <span className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {application.job?.location}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-800 to-emerald-800 rounded-full flex items-center justify-center text-white font-bold text-lg premium-glow">
                                {application.candidate?.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {application.candidate?.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {application.candidate?.email}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              Pour : <span className="font-semibold">{application.job?.title}</span> - {application.job?.company}
                            </p>
                          </>
                        )}
                        
                        {application.coverLetter && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Lettre de motivation :
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                              {application.coverLetter}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Postulé le {new Date(application.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <span className={`px-6 py-3 text-sm font-bold rounded-xl border-2 ${getStatusColor(application.status)} flex items-center gap-2 shadow-md`}>
                          <span className="text-lg">{getStatusIcon(application.status)}</span>
                          {getStatusLabel(application.status)}
                        </span>
                        
                        {session.user.userType === 'recruiter' && application.status === 'pending' && (
                          <div className="flex gap-2">
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
                              className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all duration-300 hover:shadow-lg flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
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
                              className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all duration-300 hover:shadow-lg flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Refuser
                            </button>
                          </div>
                        )}
                      </div>
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

