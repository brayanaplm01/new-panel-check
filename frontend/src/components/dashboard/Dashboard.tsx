"use client";
import React from 'react';
import { useArticles } from '@/hooks/useArticles';
import { useVerifications } from '@/hooks/useVerifications';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';
import { DiffusionChart } from '@/components/charts/DiffusionChart';
import { EngagementStats } from '@/components/charts/EngagementStats';

export default function Dashboard() {
  const { articles, loading, error, isConnected, lastUpdated } = useArticles();
  const { 
    stats: verificationStats, 
    loading: verificationsLoading, 
    error: verificationsError,
    isConnected: verificationsConnected 
  } = useVerifications();

  if (loading || verificationsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || verificationsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-red-800 font-semibold mb-2">Error de conexión</h2>
            <p className="text-red-600 mb-4">{error || verificationsError}</p>
            <p className="text-sm text-red-500">
              Asegúrate de que el backend esté ejecutándose en http://localhost:5001
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header con estado de conexión - Más compacto */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Panel de Control</h1>
          <p className="text-sm text-white">Monitoreo de verificaciones y desinformación</p>
        </div>
        <ConnectionStatus 
          isConnected={isConnected && verificationsConnected} 
          lastUpdated={lastUpdated} 
        />
      </div>

      {/* Estadísticas de engagement - Más compactas */}
      <div className="bg-neutral-800 rounded-lg shadow-sm">
        <EngagementStats articles={articles} />
      </div>

      {/* Layout en grid para optimizar espacio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfica de difusión temporal - Ocupa más espacio */}
        <div className="lg:col-span-2">
          <DiffusionChart 
            articles={articles} 
            timeRange="30d"
            className="bg-neutral-800 rounded-lg shadow-sm h-80"
          />
        </div>

        {/* Resumen de artículos - Más compacto */}
        <div className="bg-neutral-800 rounded-lg shadow-sm p-4">
          <h2 className="text-base font-semibold mb-3 text-white">Resumen de Verificaciones</h2>
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {verificationsLoading ? '...' : (verificationStats?.notStarted || 0)}
              </div>
              <div className="text-xs text-blue-600">Sin iniciar</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                {verificationsLoading ? '...' : (verificationStats?.verified || 0)}
              </div>
              <div className="text-xs text-green-600">Verificadas</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-red-600">
                {verificationsLoading ? '...' : (verificationStats?.false || 0)}
              </div>
              <div className="text-xs text-red-600">Falsas</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">
                {verificationsLoading ? '...' : (verificationStats?.inProgress || 0)}
              </div>
              <div className="text-xs text-yellow-600">En progreso</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
