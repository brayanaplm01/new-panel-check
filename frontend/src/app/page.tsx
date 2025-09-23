'use client';

import React from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import { SidebarLayout } from '@/components/layouts/SideBar';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <SidebarLayout>
        <Dashboard />
      </SidebarLayout>
    </AuthGuard>
  );
}
