import { getServerSession as nextAuthGetServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}

