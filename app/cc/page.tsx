'use client';

import EmailPassword from '@/components/dev-auth/email-password';

export default function CCPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <EmailPassword />
    </div>
  );
}
