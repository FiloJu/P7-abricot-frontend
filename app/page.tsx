'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('auth_token') || Cookies.get('token');
    router.replace(token ? '/dashboard' : '/login');
  }, [router]);

  return null;
}
