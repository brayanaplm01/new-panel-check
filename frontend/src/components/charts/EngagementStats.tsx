"use client";
import React from 'react';
import { IconTrendingUp, IconEye, IconHeart, IconMessageCircle, IconShare } from '@tabler/icons-react';
import { useEngagementMetrics } from '@/hooks/useEngagementMetrics';

interface EngagementStatsProps {
  articles?: unknown[]; // Mantenemos por compatibilidad pero no lo usamos
  className?: string;
}

export function EngagementStats({ className = '' }: EngagementStatsProps) {
  const { metrics, loading, error, isConnected } = useEngagementMetrics();

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Métricas de Engagement
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Cargando métricas...
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !isConnected) {
    return (
      <div className={`${className}`}>
        <div className="mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Métricas de Engagement
          </h3>
          <p className="text-xs text-red-600 dark:text-red-400">
            Error cargando métricas: {error || 'Sin conexión'}
          </p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`${className}`}>
        <div className="mb-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Métricas de Engagement
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            No hay datos disponibles
          </p>
        </div>
      </div>
    );
  }

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color 
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    color: string;
  }) => {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className={`p-1.5 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        
        <div className="mt-2">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {value.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {label}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Día de hoy
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
          Métricas de Engagement
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Actividad en tiempo real del día de hoy
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          icon={IconEye}
          label="Visualizaciones"
          value={metrics.visualizaciones.value}
          color="bg-blue-500"
        />
        
        <StatCard
          icon={IconHeart}
          label="Reacciones"
          value={metrics.reacciones.value}
          color="bg-red-500"
        />
        
        <StatCard
          icon={IconMessageCircle}
          label="Comentarios"
          value={metrics.comentarios.value}
          color="bg-green-500"
        />
        
        <StatCard
          icon={IconShare}
          label="Compartidos"
          value={metrics.compartidos.value}
          color="bg-purple-500"
        />
        
        <StatCard
          icon={IconTrendingUp}
          label="Nuevos Posts"
          value={metrics.nuevos_posts.value}
          color="bg-orange-500"
        />
      </div>
    </div>
  );
}
