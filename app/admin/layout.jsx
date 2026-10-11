'use client';

import { usePathname } from 'next/navigation';
import AdminShell from '../../components/AdminShell';
import { SessionProvider } from '../../components/SessionProvider';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  // The admin sign-in screen renders outside the authenticated shell.
  if (pathname.startsWith('/admin/signin')) return children;
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
