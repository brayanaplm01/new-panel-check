"use client";
import React from 'react';
import { IconRobot, IconTarget, IconBuilding, IconCopy } from '@tabler/icons-react';
import { useCountUp } from '@/hooks/useCountUp';

interface ElectoralMetricsProps {
  metrics: {
    postsConIA: number;
    postsAtacanCandidato: number;
    postsAtacanTSE: number;
    postsImitanMedio: number;
  };
  loading?: boolean;
}

export const ElectoralMetricsCards: React.FC<ElectoralMetricsProps> = ({ 
  metrics, 
  loading = false 
}) => {
  // Animaciones para los números
  const iaCount = useCountUp({ 
    end: metrics.postsConIA || 0, 
    duration: 2000, 
    delay: 200 
  });
  
  const candidateCount = useCountUp({ 
    end: metrics.postsAtacanCandidato || 0, 
    duration: 2000, 
    delay: 400 
  });
  
  const tseCount = useCountUp({ 
    end: metrics.postsAtacanTSE || 0, 
    duration: 2000, 
    delay: 600 
  });
  
  const mediaCount = useCountUp({ 
    end: metrics.postsImitanMedio || 0, 
    duration: 2000, 
    delay: 800 
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const metricsData = [
    {
      title: 'Contenido con IA',
      value: iaCount.count,
      icon: IconRobot,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      description: 'Posts creados con IA'
    },
    {
      title: 'Ataques a Candidatos',
      value: candidateCount.count,
      icon: IconTarget,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      description: 'Posts que atacan candidatos'
    },
    {
      title: 'Ataques al TSE',
      value: tseCount.count,
      icon: IconBuilding,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      description: 'Posts que atacan al TSE'
    },
    {
      title: 'Medios Imitados',
      value: mediaCount.count,
      icon: IconCopy,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: 'Posts que imitan medios'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <div 
            key={metric.title}
            className={`bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6 opacity-0 animate-fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                {metric.title}
              </h3>
            </div>
            
            <div className="space-y-1">
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {metric.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
