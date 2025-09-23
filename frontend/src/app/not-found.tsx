'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    // Verificar si hay sesión activa para decidir a dónde dirigir
    const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      router.push('/');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl mb-6">
            <span className="text-white text-3xl font-bold">!</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white mb-4">404</h1>
            <h2 className="text-xl font-semibold text-white mb-2">Página no encontrada</h2>
            <p className="text-gray-400 text-sm">
              La página a la que intentas acceder no existe o ha sido movida.
            </p>
          </div>

          {/* PanelCheck branding */}
          <div className="mb-8 pb-6 border-b border-gray-700">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-3">
              <span className="text-white text-lg font-bold">✓</span>
            </div>
            <p className="text-gray-300 text-sm">PanelCheck</p>
            <p className="text-gray-500 text-xs">Sistema de verificación de contenido</p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={handleGoHome}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              Ir al Inicio
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-center text-xs text-gray-500">
              © 2025 PanelCheck. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}