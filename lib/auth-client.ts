import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';
export const authClient = createAuthClient({ 
  baseURL:'http://localhost:3000'
    // process.env.NODE_ENV === 'production'
    //   ? 'https://lms-ali.vercel.app' // Replace with your actual domain
    //   : 'http://localhost:3000'
  ,
  plugins: [
    adminClient(),
  ] 
});

export const { 
  useSession,
  signIn,
  signOut, 
} = authClient;
