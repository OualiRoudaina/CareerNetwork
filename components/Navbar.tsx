/*import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center group">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-800 via-blue-800 to-emerald-800 bg-clip-text text-transparent group-hover:from-indigo-900 group-hover:via-blue-900 group-hover:to-emerald-900 transition-all duration-300">
                CareerNetwork
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/jobs"
                className="inline-flex items-center px-3 pt-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 relative group transition-colors duration-200"
              >
                Offres d'emploi
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-800 to-emerald-800 group-hover:w-full transition-all duration-300"></span>
              </Link>
              {session && (
                <>
                  {session.user.userType === 'candidate' && (
                    <>
                      <Link
                        href="/profile"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        Mon profil
                      </Link>
                      <Link
                        href="/recommendations"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        Recommandations
                      </Link>
                      <Link
                        href="/certifications"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        Certifications
                      </Link>
                      <Link
                        href="/applications"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        Mes candidatures
                      </Link>
                    </>
                  )}
                  {session.user.userType === 'recruiter' && (
                    <>
                      <Link
                        href="/recruiter/dashboard"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        Mes offres
                      </Link>
                      <Link
                        href="/applications"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        Candidatures
                      </Link>
                    </>
                  )}
                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {session.user.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-indigo-800 to-emerald-800 hover:from-indigo-900 hover:to-emerald-900 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-xl hover:shadow-2xl premium-glow transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/jobs"
              className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Offres d'emploi
            </Link>
            {session && (
              <>
                {session.user.userType === 'candidate' && (
                  <>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Mon profil
                    </Link>
                    <Link
                      href="/recommendations"
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Recommandations
                    </Link>
                    <Link
                      href="/certifications"
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Certifications
                    </Link>
                    <Link
                      href="/applications"
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Mes candidatures
                    </Link>
                  </>
                )}
                {session.user.userType === 'recruiter' && (
                  <>
                    <Link
                      href="/recruiter/dashboard"
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Mes offres
                    </Link>
                    <Link
                      href="/applications"
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Candidatures
                    </Link>
                  </>
                )}
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {session ? (
              <div className="px-3 space-y-3">
                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                  {session.user.name}
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="px-3 space-y-3">
                <Link
                  href="/login"
                  className="block text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
*/


import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Notifications from './Notifications';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg'
          : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative h-16 w-72">
              <Image
                src="/images/logo.png"
                alt="CareerNetwork"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              href="/jobs"
              className="relative px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
            >
              <span className="relative z-10">Offres d'emploi</span>
              <span className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
            </Link>

            {session && (
              <>
                {session.user.userType === 'candidate' && (
                  <>
                    <Link
                      href="/profile"
                      className="relative px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 group"
                    >
                      <span className="relative z-10">Mon profil</span>
                      <span className="absolute inset-0 bg-purple-50 dark:bg-purple-900/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    </Link>
                    <Link
                      href="/recommendations"
                      className="relative px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-300 group"
                    >
                      <span className="relative z-10">Recommandations IA</span>
                      <span className="absolute inset-0 bg-pink-50 dark:bg-pink-900/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    </Link>
                    <Link
                      href="/applications"
                      className="relative px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 group"
                    >
                      <span className="relative z-10">Mes candidatures</span>
                      <span className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    </Link>
                  </>
                )}
                {session.user.userType === 'recruiter' && (
                  <>
                    <Link
                      href="/recruiter/dashboard"
                      className="relative px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 group"
                    >
                      <span className="relative z-10">Mes offres</span>
                      <span className="absolute inset-0 bg-purple-50 dark:bg-purple-900/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    </Link>
                    <Link
                      href="/applications"
                      className="relative px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 group"
                    >
                      <span className="relative z-10">Candidatures</span>
                      <span className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                    </Link>
                  </>
                )}
                {session.user.role === 'superadmin' && (
                  <Link
                    href="/superadmin"
                    className="relative px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 group"
                  >
                    <span className="relative z-10">Super Admin</span>
                    <span className="absolute inset-0 bg-purple-50 dark:bg-purple-900/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {session ? (
              <div className="flex items-center space-x-4">
                <Notifications />
                <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-900/20 dark:to-emerald-900/20 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-800 to-emerald-800 flex items-center justify-center text-white font-bold text-sm premium-glow">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {session.user.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="relative px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50"
                >
                  <span className="relative z-10">Déconnexion</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="relative px-6 py-2.5 bg-gradient-to-r from-indigo-800 via-blue-800 to-emerald-800 text-white font-bold rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/50 premium-glow"
                >
                  <span className="relative z-10">Inscription</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-blue-900 to-emerald-900 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              ></span>
              <span
                className={`w-full h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              ></span>
              <span
                className={`w-full h-0.5 bg-gray-700 dark:bg-gray-300 transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              ></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/jobs"
            className="block px-4 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-300"
          >
            Offres d'emploi
          </Link>
          {session && (
            <>
              {session.user.userType === 'candidate' && (
                <>
                  <Link
                    href="/profile"
                    className="block px-4 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-300"
                  >
                    Mon profil
                  </Link>
                  <Link
                    href="/recommendations"
                    className="block px-4 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors duration-300"
                  >
                    Recommandations IA
                  </Link>
                  <Link
                    href="/applications"
                    className="block px-4 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors duration-300"
                  >
                    Mes candidatures
                  </Link>
                </>
              )}
              {session.user.userType === 'recruiter' && (
                <>
                  <Link
                    href="/recruiter/dashboard"
                    className="block px-4 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-300"
                  >
                    Mes offres
                  </Link>
                  <Link
                    href="/applications"
                    className="block px-4 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors duration-300"
                  >
                    Candidatures
                  </Link>
                </>
              )}
              {session.user.role === 'superadmin' && (
                <Link
                  href="/superadmin"
                  className="block px-4 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-300"
                >
                  Super Admin
                </Link>
              )}
            </>
          )}
          <div className="pt-4 space-y-2">
            {session ? (
              <>
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-900/20 dark:to-emerald-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-800 to-emerald-800 flex items-center justify-center text-white font-bold premium-glow">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-base font-bold text-gray-800 dark:text-gray-200">
                      {session.user.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-lg text-center transition-all duration-300 hover:shadow-lg"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-3 text-base font-semibold text-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-300"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-3 bg-gradient-to-r from-indigo-800 via-blue-800 to-emerald-800 text-white font-bold rounded-lg text-center transition-all duration-300 hover:shadow-xl premium-glow"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}