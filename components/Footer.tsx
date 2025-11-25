import Link from 'next/link';

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
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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
            <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CareerNetwork
            </span>
            . Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
