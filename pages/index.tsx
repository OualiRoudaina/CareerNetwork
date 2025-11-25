import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>CareerNetwork - Trouvez votre emploi idéal</title>
        <meta name="description" content="Plateforme intelligente de mise en relation entre étudiants, jeunes diplômés et entreprises" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-24 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center animate-fadeIn">
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white animate-pulse">
                  Trouvez votre emploi idéal
                </h1>
                <p className="text-xl md:text-2xl mb-10 text-blue-100 font-light">
                  Recommandations intelligentes basées sur vos compétences
                </p>
                {!session ? (
                  <div className="flex justify-center space-x-4 flex-wrap gap-4">
                    <Link
                      href="/register"
                      className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
                    >
                      Commencer gratuitement
                    </Link>
                    <Link
                      href="/login"
                      className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transform hover:scale-105 shadow-xl transition-all duration-300"
                    >
                      Se connecter
                    </Link>
                  </div>
                ) : (
                  <div className="flex justify-center space-x-4 flex-wrap gap-4">
                    <Link
                      href="/recommendations"
                      className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
                    >
                      Trouver mes offres
                    </Link>
                    <Link
                      href="/jobs"
                      className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transform hover:scale-105 shadow-xl transition-all duration-300"
                    >
                      Voir les offres
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-gray-900 dark:text-white">
                Pourquoi choisir <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CareerNetwork</span> ?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">🤖</div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      Recommandations IA
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Notre intelligence artificielle analyse votre profil et vous propose les offres les plus pertinentes.
                    </p>
                  </div>
                </div>
                <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">🎯</div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      Matching intelligent
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Trouvez rapidement les emplois qui correspondent à vos compétences et aspirations.
                    </p>
                  </div>
                </div>
                <div className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-red-500/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">📈</div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      Profil complet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Créez un profil détaillé avec vos compétences, formations et expériences professionnelles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}

