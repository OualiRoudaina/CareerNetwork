import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session, filter]);

  const fetchNotifications = async () => {
    try {
      const url = filter === 'unread' ? '/api/notifications?read=false' : '/api/notifications';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, read: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter((n) => !n.read).map((n) =>
          fetch('/api/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: n._id, read: true }),
          })
        )
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications?notificationId=${notificationId}`, {
        method: 'DELETE',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_application':
        return '📝';
      case 'application_status':
        return '📊';
      case 'new_job':
        return '💼';
      case 'message':
        return '💬';
      case 'interview':
        return '📅';
      case 'reminder':
        return '⏰';
      default:
        return '🔔';
    }
  };

  if (status === 'loading' || loading) {
    return <Loader />;
  }

  if (!session) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <Head>
        <title>Notifications - CareerNetwork</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Tout marquer comme lu
                  </button>
                )}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
                  className="px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">Toutes</option>
                  <option value="unread">Non lues</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Aucune notification
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${
                      !notification.read ? 'border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`text-lg font-semibold ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {notification.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                              {new Date(notification.createdAt).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                              >
                                Marquer comme lu
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                        {notification.link && (
                          <button
                            onClick={() => router.push(notification.link!)}
                            className="mt-4 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          >
                            Voir les détails →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}





