/*import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              CareerNetwork
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Plateforme intelligente de mise en relation entre étudiants, jeunes diplômés et entreprises.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Liens rapides</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link
                  href="/jobs"
                  className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Offres d'emploi
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Mon profil
                </Link>
              </li>
              <li>
                <Link
                  href="/recommendations"
                  className="hover:text-blue-400 transition-colors duration-200 inline-flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                  Recommandations IA
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Contact</h3>
            <p className="text-gray-300 leading-relaxed">
              Pour toute question, contactez-nous à{' '}
              <a
                href="mailto:support@careernetwork.com"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
              >
                support@careernetwork.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700/50 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()}{' '}
            <span className="font-semibold bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              CareerNetwork
            </span>
            . Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
*/


import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-800 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-800 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="relative h-16 w-64 mb-4">
              <Image
                src="/images/logo.png"
                alt="CareerNetwork"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              Plateforme intelligente de mise en relation entre talents et opportunités.
              Propulsez votre carrière avec l'IA.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Liens rapides</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/jobs" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-emerald-600 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  Offres d'emploi
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-emerald-600 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  Mon profil
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                  <span className="w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-emerald-600 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  Recommandations IA
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Contact</h4>
            <div className="space-y-3">
              <p className="text-gray-300 flex items-start">
                <svg className="w-5 h-5 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:support@careernetwork.com" className="hover:text-white transition-colors duration-300">
                  support@careernetwork.com
                </a>
              </p>
              <p className="text-gray-300 flex items-start">
                <svg className="w-5 h-5 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Paris, France
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm flex items-center">
              &copy; {new Date().getFullYear()}{' '}
              <span className="relative h-6 w-32 mx-2 inline-block">
                <Image
                  src="/images/logo.png"
                  alt="CareerNetwork"
                  fill
                  className="object-contain opacity-80"
                />
              </span>
              . Tous droits réservés.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Politique de confidentialité
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Conditions d'utilisation
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>

    );
}