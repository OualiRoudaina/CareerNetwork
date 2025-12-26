import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Alert from '@/components/Alert';
import Image from 'next/image';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'candidate' | 'recruiter'>('candidate');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    if (password !== confirmPassword) {
      setAlert({ message: 'Les mots de passe ne correspondent pas', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, userType }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ message: 'Compte créé avec succès ! Redirection...', type: 'success' });
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setAlert({ message: data.message || 'Erreur lors de l\'inscription', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: 'Erreur de connexion', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Inscription - CareerNetwork</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-28 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Image placeholder */}
            <div className="hidden lg:flex flex-col items-center justify-center p-8 order-2">
              <div className="w-full h-full min-h-[600px] bg-gradient-to-br from-emerald-900 via-blue-900 to-indigo-900 rounded-3xl shadow-2xl relative overflow-hidden flex items-center justify-center premium-glow">
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-2xl"></div>
                  <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-2xl"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white rounded-full blur-3xl"></div>
                </div>
                
                {/* Image placeholder - Replace with actual image */}
                <div className="relative z-10 text-center text-white p-8">
                <div className="mb-6 w-full max-w-md h-64 relative rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="/images/register.png"
                      alt="CareerNetwork Login"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Rejoignez CareerNetwork</h3>
                  <p className="text-lg text-white/90 max-w-md">
                    Créez votre compte et accédez à des milliers d'offres d'emploi personnalisées. Trouvez votre emploi idéal en quelques clics.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Register form */}
            <div className="w-full max-w-md mx-auto order-1 lg:order-2">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-800 to-indigo-800 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl premium-glow">
                    ✨
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Créez votre compte
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Rejoignez des milliers de professionnels
                  </p>
                </div>

                {alert && (
                  <div className="mb-6">
                    <Alert
                      message={alert.message}
                      type={alert.type}
                      onClose={() => setAlert(null)}
                    />
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nom complet
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Adresse email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                        placeholder="Minimum 6 caractères"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-300"
                        placeholder="Répétez le mot de passe"
                      />
                    </div>
                  </div>

                  {/* User Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Je suis un(e)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setUserType('candidate')}
                        className={`relative px-4 py-4 border-2 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden ${
                          userType === 'candidate'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-600'
                        }`}
                      >
                        <div className="relative z-10">
                          <div className="text-2xl mb-2">👤</div>
                          <div>Candidat</div>
                          <div className="text-xs mt-1 opacity-75">Je cherche un emploi</div>
                        </div>
                        {userType === 'candidate' && (
                          <div className="absolute top-2 right-2">
                            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setUserType('recruiter')}
                        className={`relative px-4 py-4 border-2 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden ${
                          userType === 'recruiter'
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-600'
                        }`}
                      >
                        <div className="relative z-10">
                          <div className="text-2xl mb-2">🏢</div>
                          <div>Recruteur</div>
                          <div className="text-xs mt-1 opacity-75">Je poste des offres</div>
                        </div>
                        {userType === 'recruiter' && (
                          <div className="absolute top-2 right-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-indigo-800 via-blue-800 to-emerald-800 hover:from-indigo-900 hover:via-blue-900 hover:to-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl premium-glow transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création en cours...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Créer mon compte
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    )}
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Déjà un compte ?{' '}
                    <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                      Connectez-vous
                    </Link>
                  </p>
                </div>

                {/* Trust indicators */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    100% Gratuit
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Données sécurisées
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
