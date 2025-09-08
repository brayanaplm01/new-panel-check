"use client";
import React from 'react';
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

interface SimpleChartProps {
  title: string;
  data: Record<string, number>;
  className?: string;
  color?: string;
}

export function SimpleChart({ 
  title, 
  data, 
  className = '', 
  color = 'rgb(59, 130, 246)' 
}: SimpleChartProps) {
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

  const sortedEntries = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const maxValue = Math.max(...Object.values(data));

  return (
    <div className={cn(
      "bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6 min-h-[500px]",
      className
    )}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
          <IconWorld className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      
      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
        {sortedEntries.map(([label, value]) => {
          const socialInfo = getSocialMediaInfo(label);
          const Icon = socialInfo.icon;
          const percentage = (value / maxValue) * 100;
          
          return (
            <div key={label} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-all duration-200 group">
              <div className={`p-2 rounded-lg ${socialInfo.bgColor} shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {label}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white ml-2 flex-shrink-0">
                    {value.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-3 relative overflow-hidden">
                  <div 
                    className="h-3 rounded-full transition-all duration-1000 shadow-sm"
                    style={{ 
                      backgroundColor: socialInfo.color,
                      width: `${percentage}%`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Resumen mejorado */}
      <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-gray-50 dark:bg-neutral-700/30 rounded-lg">
            <div className="font-medium text-gray-900 dark:text-white">
              {Object.keys(data).length}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">
              Plataformas
            </div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-neutral-700/30 rounded-lg">
            <div className="font-medium text-gray-900 dark:text-white">
              {Object.values(data).reduce((sum, val) => sum + val, 0).toLocaleString()}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-xs">
              Total Interacciones
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
