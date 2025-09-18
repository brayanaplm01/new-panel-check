"use client";
import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { cn } from '@/lib/utils';
import { 
  IconBrandTiktok,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandYoutube,
  IconBrandWhatsapp,
  IconBrandTelegram,
  IconWorld,
  IconCategory
} from '@tabler/icons-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface InteractionBarChartProps {
  title: string;
  data: Record<string, number>;
  className?: string;
  color?: string;
  maxItems?: number;
}

export function InteractionBarChart({ 
  title, 
  data, 
  className = '',
  maxItems = 10
}: InteractionBarChartProps) {
  // Mapeo exacto de las redes sociales del backend con iconos y colores
  const getSocialMediaInfo = (label: string): { icon: React.ComponentType<{ size?: number; className?: string }>, color: string, bgColor: string } => {
    // Mapeo exacto basado en tu backend socialStats
    const socialMapping: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>, color: string, bgColor: string }> = {
      'TikTok': { icon: IconBrandTiktok, color: '#000000', bgColor: 'bg-black' },
      'Facebook': { icon: IconBrandFacebook, color: '#1877F2', bgColor: 'bg-blue-600' },
      'Instagram': { icon: IconBrandInstagram, color: '#E4405F', bgColor: 'bg-pink-500' },
      'Twitter/X': { icon: IconBrandTwitter, color: '#000000', bgColor: 'bg-black' },
      'YouTube': { icon: IconBrandYoutube, color: '#FF0000', bgColor: 'bg-red-600' },
      'WhatsApp': { icon: IconBrandWhatsapp, color: '#25D366', bgColor: 'bg-green-500' },
      'Telegram': { icon: IconBrandTelegram, color: '#0088CC', bgColor: 'bg-blue-500' },
      'Web': { icon: IconWorld, color: '#6B7280', bgColor: 'bg-gray-500' },
      'Otros': { icon: IconCategory, color: '#9CA3AF', bgColor: 'bg-gray-400' }
    };

    // Buscar coincidencia exacta primero
    if (socialMapping[label]) {
      return socialMapping[label];
    }

    // Buscar coincidencias parciales para mayor flexibilidad
    const lowerLabel = label.toLowerCase();
    for (const [key, value] of Object.entries(socialMapping)) {
      if (lowerLabel.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerLabel)) {
        return value;
      }
    }

    // Por defecto, usar "Otros"
    return socialMapping['Otros'];
  };

  const chartData = useMemo(() => {
    // Ordenar datos por valor descendente y limitar elementos
    const sortedEntries = Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxItems);

    const labels = sortedEntries.map(([label]) => {
      // Truncar etiquetas largas
      return label.length > 20 ? label.substring(0, 20) + '...' : label;
    });
    const values = sortedEntries.map(([, value]) => value);

    // Crear colores dinámicos basados en redes sociales
    const backgroundColors = sortedEntries.map(([label]) => {
      const socialInfo = getSocialMediaInfo(label);
      return socialInfo.color.replace('#', 'rgba(').replace(/(.{2})(.{2})(.{2})/, '$1, $2, $3, 0.1)');
    });

    const borderColors = sortedEntries.map(([label]) => {
      const socialInfo = getSocialMediaInfo(label);
      return socialInfo.color;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Interacciones',
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [data, maxItems]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(209, 213, 219)',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: { parsed: { x: number } }) {
            return `Interacciones: ${context.parsed.x.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          drawOnChartArea: true,
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 11,
          },
          callback: function(value: string | number) {
            return typeof value === 'number' ? value.toLocaleString() : value;
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 11,
          },
          maxRotation: 0,
        },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutCubic' as const,
    },
  }), []);

  const totalInteractions = Object.values(data).reduce((sum, value) => sum + value, 0);
  const isEmpty = totalInteractions === 0;

  if (isEmpty) {
    return (
      <div className={cn(
        "bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6",
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <p className="text-sm">No hay datos disponibles</p>
            <p className="text-xs mt-1">Aún no se han registrado interacciones</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col min-h-[600px]",
      className
    )}>
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <IconWorld className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total: {totalInteractions.toLocaleString()} interacciones
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {Object.keys(data).length} plataformas
            </div>
            {maxItems < Object.keys(data).length && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Top {maxItems} más activas
              </div>
            )}
          </div>
        </div>
        
        {/* Leyenda con iconos de redes sociales */}
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(data)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([label, value]) => {
              const socialInfo = getSocialMediaInfo(label);
              const Icon = socialInfo.icon;
              return (
                <div key={label} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-neutral-700 rounded-full hover:shadow-md transition-all duration-200">
                  <div className={`p-1 rounded-full ${socialInfo.bgColor} shadow-sm`}>
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {label.length > 12 ? label.substring(0, 12) + '...' : label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {value.toLocaleString()}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
      
      <div className="p-4 flex-1">
        <div style={{ height: '400px' }}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}
