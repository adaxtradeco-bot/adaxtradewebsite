'use client';

import { useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function useAdminUser(): { user: AdminUser | null; isAdmin: boolean } {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('adminUser');
    if (raw) setUser(JSON.parse(raw));
  }, []);

  return { user, isAdmin: user?.role === 'admin' };
}
