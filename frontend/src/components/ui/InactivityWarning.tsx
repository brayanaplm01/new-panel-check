'use client';

import React from 'react';

interface InactivityWarningProps {
  isVisible: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  remainingTime: number;
}

export function InactivityWarning({ isVisible, onExtendSession, onLogout, remainingTime }: InactivityWarningProps) {
  console.log('🔍 InactivityWarning render:', { isVisible, remainingTime });
  
  if (!isVisible) {
    console.log('❌ Modal no visible, retornando null');
    return null;
  }

  console.log('✅ Modal visible, renderizando componente');
  
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
    >
      <div className="bg-red-600 border-2 border-yellow-400 rounded-xl shadow-2xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">⚠️ MODAL DE PRUEBA ⚠️</h2>
          <h3 className="text-lg font-bold text-white mb-2">Sesión por expirar</h3>
          <p className="text-white text-sm mb-4">
            Tu sesión se cerrará automáticamente en:
          </p>
          <div className="text-2xl font-mono text-yellow-400">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              console.log('🔄 Botón extender sesión clickeado');
              onExtendSession();
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
          >
            Extender Sesión
          </button>
          <button
            onClick={() => {
              console.log('🚪 Botón cerrar sesión clickeado');
              onLogout();
            }}
            className="flex-1 bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}