import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.BETTER_AUTH_URL || 'https://lms-ali.vercel.app';
  }
  
  // For development, try to use the current port or fallback to 3001
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  return process.env.BETTER_AUTH_URL || 'http://localhost:3000';
};

export const authClient = createAuthClient({ 
  baseURL: getBaseURL(),
  plugins: [
    adminClient(),
  ] 
});

export const { 
  useSession,
  signIn,
  signOut, 
} = authClient;
