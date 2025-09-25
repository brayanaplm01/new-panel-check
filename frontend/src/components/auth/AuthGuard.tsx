'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAutoLogout } from '@/hooks/useAutoLogout';
import { InactivityWarning } from '@/components/ui/InactivityWarning';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Usar el hook de auto-logout
  const { logout, extendSession, showWarning, remainingTime } = useAutoLogout({
    timeoutMinutes: 15,
    warningMinutes: 1,
    onLogout: () => {
      console.log('Sesión cerrada automáticamente por inactividad o cierre de ventana');
    }
  });

  // Debug logging para el estado
  console.log('🔍 AuthGuard state:', { showWarning, remainingTime, isAuthenticated });

  useEffect(() => {
    // Verificar si hay sesión activa al cargar la página
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userInfo = localStorage.getItem('user');
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !userInfo) {
      // Si no hay sesión válida, redirigir al login
      console.log('❌ No hay sesión válida, redirigiendo al login');
      router.push('/login');
    } else {
      // Si hay sesión válida, verificar que no haya expirado
      try {
        const user = JSON.parse(userInfo);
        console.log('✅ Sesión válida encontrada para:', user.name);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch {
        // Si hay error al parsear la información del usuario, limpiar y redirigir
        console.log('⚠️ Error al parsear información de usuario, limpiando sesión');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        router.push('/login');
      }
    }
  }, [router]);

  // Mostrar loading mientras verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          <div className="text-white text-xl">Cargando...</div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (ya está redirigiendo)
  if (!isAuthenticated) {
    return null;
  }

  // Si está autenticado, mostrar el contenido con posible advertencia de inactividad
  return (
    <>
      {children}
      <InactivityWarning
        isVisible={showWarning}
        onExtendSession={extendSession}
        onLogout={logout}
        remainingTime={remainingTime}
      />
    </>
  );
}