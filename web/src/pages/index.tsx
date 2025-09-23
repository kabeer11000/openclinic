import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '@nanostores/react';
import { $user, $loading } from '@/store/auth';

export default function Home() {
  const router = useRouter();
  const user = useStore($user);
  const loading = useStore($loading);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
