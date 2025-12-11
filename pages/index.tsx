/*import Head from 'next/head';
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
*/

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
        
        {/* Hero Section */}
        <main className="flex-grow pt-20">
          <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
              <div className="absolute top-40 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
              <div className="text-center space-y-8 animate-fadeIn">
                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold animate-scaleIn">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Plateforme #1 pour votre carrière
                </div>

                {/* Main heading */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight animate-slideInLeft">
                  Trouvez votre
                  <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                      emploi idéal
                    </span>
                    <span className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-400/30 blur-lg"></span>
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light animate-slideInRight">
                  Recommandations intelligentes basées sur vos compétences.
                  <br />
                  Propulsé par l'Intelligence Artificielle.
                </p>

                {/* CTA Buttons */}
                {!session ? (
                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 animate-scaleIn">
                    <Link
                      href="/register"
                      className="group relative px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Commencer gratuitement
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </Link>
                    <Link
                      href="/login"
                      className="group px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 hover:border-white/50"
                    >
                      <span className="flex items-center justify-center">
                        Se connecter
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 animate-scaleIn">
                    <Link
                      href="/recommendations"
                      className="group relative px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        🤖 Trouver mes offres IA
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </Link>
                    <Link
                      href="/jobs"
                      className="group px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 hover:border-white/50"
                    >
                      <span className="flex items-center justify-center">
                        Parcourir les offres
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                )}

                {/* Stats */}
                <div className="pt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
                  <div className="text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <div className="text-4xl md:text-5xl font-black text-white mb-2">10K+</div>
                    <div className="text-white/80 text-sm md:text-base">Offres actives</div>
                  </div>
                  <div className="text-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                    <div className="text-4xl md:text-5xl font-black text-white mb-2">50K+</div>
                    <div className="text-white/80 text-sm md:text-base">Utilisateurs</div>
                  </div>
                  <div className="text-center animate-fadeIn" style={{ animationDelay: '0.6s' }}>
                    <div className="text-4xl md:text-5xl font-black text-white mb-2">95%</div>
                    <div className="text-white/80 text-sm md:text-base">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16 animate-fadeIn">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                  Pourquoi choisir{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    CareerNetwork
                  </span>
                  ?
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Une plateforme moderne qui révolutionne la recherche d'emploi
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-fadeIn">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      🤖
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      IA Avancée
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Notre intelligence artificielle analyse en profondeur votre profil pour vous proposer les offres les plus pertinentes et adaptées à vos compétences.
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>

                {/* Feature 2 */}
                <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 mb-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      🎯
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      Matching Précis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Trouvez rapidement les emplois qui correspondent exactement à vos compétences, vos aspirations et votre niveau d'expérience.
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>

                {/* Feature 3 */}
                <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-red-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 mb-6 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                      📈
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                      Profil Dynamique
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Créez un profil complet et détaillé avec vos compétences, formations, expériences et générez votre CV en un clic.
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16 animate-fadeIn">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Comment ça marche ?
                </h2>
                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                  Trouvez votre emploi idéal en 3 étapes simples
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="relative animate-fadeIn">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl font-black text-blue-600 mb-6 shadow-lg">
                      1
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Créez votre profil</h3>
                    <p className="text-white/80 leading-relaxed">
                      Renseignez vos compétences, vos formations et vos expériences professionnelles en quelques minutes.
                    </p>
                  </div>
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-white/30"></div>
                </div>

                {/* Step 2 */}
                <div className="relative animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl font-black text-purple-600 mb-6 shadow-lg">
                      2
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Recevez des recommandations</h3>
                    <p className="text-white/80 leading-relaxed">
                      Notre IA analyse votre profil et vous propose les offres les plus adaptées à votre profil.
                    </p>
                  </div>
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-white/30"></div>
                </div>

                {/* Step 3 */}
                <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl font-black text-pink-600 mb-6 shadow-lg">
                      3
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Postulez en un clic</h3>
                    <p className="text-white/80 leading-relaxed">
                      Candidatez directement aux offres qui vous intéressent et suivez vos candidatures en temps réel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden animate-fadeIn">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                    Prêt à transformer votre carrière ?
                  </h2>
                  <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    Rejoignez des milliers de professionnels qui ont trouvé leur emploi idéal grâce à CareerNetwork
                  </p>
                  <Link
                    href={session ? "/recommendations" : "/register"}
                    className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 group"
                  >
                    {session ? "Découvrir mes offres IA" : "Commencer maintenant"}
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
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
