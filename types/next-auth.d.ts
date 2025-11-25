import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      userType: 'candidate' | 'recruiter';
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    userType: 'candidate' | 'recruiter';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    userType: 'candidate' | 'recruiter';
  }
}

