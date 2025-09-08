"use client";
import React from 'react';
import { AnimatedChart } from '@/components/charts/AnimatedChart';

interface ElectoralDistributionProps {
  casoElectoralDistribution: Record<string, number>;
  formatoDistribution: Record<string, number>;
  redSocialDistribution: Record<string, number>;
  loading?: boolean;
}

export const ElectoralDistributionCharts: React.FC<ElectoralDistributionProps> = ({ 
  casoElectoralDistribution,
  formatoDistribution,
  redSocialDistribution,
  loading = false 
}) => {
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((index) => (
          <div key={index} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6 h-[400px]">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Distribución por Caso Electoral */}
      <div className="opacity-0 animate-fade-in-up delay-200">
        <AnimatedChart
          title="Tipo de Caso Electoral"
          data={casoElectoralDistribution}
          color="rgb(168, 85, 247)" // purple-500
        />
      </div>
      
      {/* Distribución por Formato */}
      <div className="opacity-0 animate-fade-in-up delay-300">
        <AnimatedChart
          title="Formato de Contenido"
          data={formatoDistribution}
          color="rgb(59, 130, 246)" // blue-500
        />
      </div>
      
      {/* Distribución por Red Social */}
      <div className="opacity-0 animate-fade-in-up delay-400">
        <AnimatedChart
          title="Red Social de Origen"
          data={redSocialDistribution}
          color="rgb(16, 185, 129)" // green-500
        />
      </div>
    </div>
  );
};
