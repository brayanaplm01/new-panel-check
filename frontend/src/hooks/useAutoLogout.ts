'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseAutoLogoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onLogout?: () => void;
  onWarning?: () => void;
}

export function useAutoLogout(options: UseAutoLogoutOptions = {}) {
  const { timeoutMinutes = 15, warningMinutes = 1, onLogout, onWarning } = options;
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Función para cerrar sesión
  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      
      // Limpiar todos los timers
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownRef.current) clearTimeout(countdownRef.current);
      
      setShowWarning(false);
      
      // Llamar callback personalizado si existe
      if (onLogout) {
        onLogout();
      }
      
      // Redirigir al login
      router.push('/login');
    }
  }, [router, onLogout]);

  // Función para mostrar advertencia
  const showInactivityWarning = useCallback(() => {
    console.log('🔔 Mostrando modal de advertencia de inactividad');
    setShowWarning(true);
    setRemainingTime(warningMinutes * 60);
    
    if (onWarning) {
      onWarning();
    }

    // Iniciar countdown
    const startCountdown = () => {
      console.log(`⏱️ Iniciando countdown de ${warningMinutes} minutos`);
      countdownRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            console.log('⏰ Tiempo agotado, ejecutando logout');
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    startCountdown();
  }, [warningMinutes, onWarning, logout]);

  // Función para resetear el timer de inactividad
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Limpiar timeouts anteriores
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    
    setShowWarning(false);
    
    // Calcular tiempo para mostrar advertencia (timeoutMinutes - warningMinutes)
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    
    console.log(`🔧 Auto-logout configurado:`);
    console.log(`   - Logout total: ${timeoutMinutes} minutos`);
    console.log(`   - Advertencia en: ${warningTime / 1000 / 60} minutos`);
    console.log(`   - Timer advertencia: ${warningTime}ms`);
    console.log(`   - Timer logout: ${timeoutMinutes * 60 * 1000}ms`);
    
    // Crear timeout para mostrar advertencia
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        console.log('⚠️ Mostrando advertencia de inactividad');
        showInactivityWarning();
      }, warningTime);
    }
    
    // Crear timeout final para logout
    timeoutRef.current = setTimeout(() => {
      console.log('🚪 Ejecutando logout automático por inactividad');
      logout();
    }, timeoutMinutes * 60 * 1000);
  }, [logout, timeoutMinutes, warningMinutes, showInactivityWarning]);

  // Función para extender la sesión
  const extendSession = useCallback(() => {
    console.log('🔄 Extendiendo sesión manualmente');
    setShowWarning(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  useEffect(() => {
    // Verificar si hay sesión activa
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      console.log('❌ No hay sesión activa, no iniciando auto-logout');
      return;
    }

    console.log('✅ Sesión activa detectada, iniciando auto-logout timer');
    
    // Inicializar timer de inactividad
    resetInactivityTimer();

    // Eventos que detectan actividad del usuario
    const events = [
      'mousedown',
      'mousemove', 
      'keydown',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus',
      'wheel'
    ];

    // Agregar listeners para detectar actividad
    const handleActivity = (event: Event) => {
      // Solo logear ciertos eventos importantes para no spam la consola
      if (['click', 'keydown', 'scroll'].includes(event.type)) {
        console.log(`🔄 Actividad detectada: ${event.type} - reiniciando timer`);
      }
      resetInactivityTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup function
    return () => {
      console.log('🧹 Limpiando listeners de actividad');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [resetInactivityTimer]);

  // Manejo de visibilidad de pestaña para detectar inactividad prolongada
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // La pestaña se ocultó - guardar timestamp para verificar tiempo transcurrido
        localStorage.setItem('lastActiveTime', Date.now().toString());
        console.log('🔍 Pestaña oculta, guardando tiempo de última actividad');
      } else {
        // La pestaña volvió a ser visible - verificar si ha pasado demasiado tiempo
        const lastActiveTime = localStorage.getItem('lastActiveTime');
        if (lastActiveTime) {
          const timeDiff = Date.now() - parseInt(lastActiveTime);
          const minutesDiff = timeDiff / (1000 * 60);
          
          console.log(`🔍 Pestaña visible, tiempo transcurrido: ${minutesDiff.toFixed(1)} minutos`);
          
          // Si ha pasado más tiempo del permitido, cerrar sesión
          if (minutesDiff > timeoutMinutes) {
            console.log('⏰ Tiempo límite excedido, cerrando sesión');
            logout();
          } else {
            // Resetear timer si está dentro del tiempo permitido
            console.log('✅ Tiempo dentro del límite, reseteando timer');
            resetInactivityTimer();
          }
        } else {
          // Si no hay tiempo guardado, simplemente resetear timer
          resetInactivityTimer();
        }
      }
    };

    // Solo agregar listener de visibilidad (NO beforeunload para evitar logout en recarga)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logout, timeoutMinutes, resetInactivityTimer]);

  console.log('🔧 useAutoLogout return values:', { showWarning, remainingTime });

  return {
    logout,
    resetTimer: resetInactivityTimer,
    extendSession,
    showWarning,
    remainingTime
  };
}