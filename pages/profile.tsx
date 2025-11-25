import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MultiStepCVForm from '@/components/MultiStepCVForm';
import Loader from '@/components/Loader';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        try {
          const response = await fetch('/api/profile');
          if (response.ok) {
            const data = await response.json();
            setProfileData({ name: data.name, profile: data.profile });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return <Loader />;
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Mon profil - CareerNetwork</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Mon profil
            </h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <MultiStepCVForm initialData={profileData} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

