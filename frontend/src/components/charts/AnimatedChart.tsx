import React, { useState, useEffect } from 'react';
import { 
  IconBrandTiktok,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandYoutube,
  IconBrandWhatsapp,
  IconBrandTelegram,
  IconWorld,
  IconCategory,
  IconShieldCheck,
  IconShieldX,
  IconAlertTriangle,
  IconClock,
  IconLoader,
  IconX,
  IconVideo,
  IconPhoto,
  IconFileText,
  IconMusic,
  IconTag
} from '@tabler/icons-react';

interface AnimatedChartProps {
  title: string;
  data: Record<string, number>;
  color: string;
}

export const AnimatedChart: React.FC<AnimatedChartProps> = ({ title, data, color }) => {
  const [animatedData, setAnimatedData] = useState<Record<string, number>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  // Mapeo completo para todas las categorías
  const getItemInfo = (label: string, chartTitle: string) => {
    // Mapeo para Redes Sociales
    if (chartTitle.toLowerCase().includes('red social') || chartTitle.toLowerCase().includes('social')) {
      const socialMapping: Record<string, { icon: any, color: string, bgColor: string }> = {
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
      
      if (socialMapping[label]) return socialMapping[label];
      
      // Búsqueda flexible para redes sociales
      const lowerLabel = label.toLowerCase();
      for (const [key, value] of Object.entries(socialMapping)) {
        if (lowerLabel.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerLabel)) {
          return value;
        }
      }
      return socialMapping['Otros'];
    }

    // Mapeo para Status/Estados
    if (chartTitle.toLowerCase().includes('status') || chartTitle.toLowerCase().includes('estado')) {
      const statusMapping: Record<string, { icon: any, color: string, bgColor: string }> = {
        'Verificado': { icon: IconShieldCheck, color: '#10B981', bgColor: 'bg-green-500' },
        'Falso': { icon: IconShieldX, color: '#EF4444', bgColor: 'bg-red-500' },
        'Engañoso': { icon: IconAlertTriangle, color: '#F59E0B', bgColor: 'bg-yellow-500' },
        'Sin iniciar': { icon: IconClock, color: '#6B7280', bgColor: 'bg-gray-500' },
        'En progreso': { icon: IconLoader, color: '#3B82F6', bgColor: 'bg-blue-500' },
        'Inconcluso': { icon: IconX, color: '#8B5CF6', bgColor: 'bg-purple-500' }
      };
      
      if (statusMapping[label]) return statusMapping[label];
      return { icon: IconClock, color: '#6B7280', bgColor: 'bg-gray-500' };
    }

    // Mapeo para Formatos
    if (chartTitle.toLowerCase().includes('formato')) {
      const formatMapping: Record<string, { icon: any, color: string, bgColor: string }> = {
        'Audiovisual': { icon: IconVideo, color: '#DC2626', bgColor: 'bg-red-600' },
        'Imagen': { icon: IconPhoto, color: '#059669', bgColor: 'bg-emerald-600' },
        'Texto': { icon: IconFileText, color: '#1D4ED8', bgColor: 'bg-blue-700' },
        'Audio': { icon: IconMusic, color: '#7C3AED', bgColor: 'bg-violet-600' },
        'Otros': { icon: IconCategory, color: '#6B7280', bgColor: 'bg-gray-500' }
      };
      
      if (formatMapping[label]) return formatMapping[label];
      return formatMapping['Otros'];
    }

    // Mapeo para Tags
    if (chartTitle.toLowerCase().includes('tag')) {
      return { icon: IconTag, color: '#8B5CF6', bgColor: 'bg-purple-500' };
    }

    // Por defecto
    return { icon: IconCategory, color: color, bgColor: 'bg-gray-500' };
  };

  // Calcular el máximo valor
  const maxValue = Math.max(...Object.values(data));

  useEffect(() => {
    // Inicializar todos los valores en 0
    const initialData = Object.keys(data).reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {} as Record<string, number>);
    
    setAnimatedData(initialData);
    setIsAnimating(true);

    // Iniciar animación después de un delay
    const timer = setTimeout(() => {
      const duration = 2000; // 2 segundos
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Función de easing suave
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        const newAnimatedData = Object.keys(data).reduce((acc, key) => {
          const targetValue = data[key];
          acc[key] = Math.floor(targetValue * easeOutQuart);
          return acc;
        }, {} as Record<string, number>);

        setAnimatedData(newAnimatedData);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Asegurar valores finales exactos
          setAnimatedData(data);
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }, 1200); // Delay para que empiece después del resumen

    return () => clearTimeout(timer);
  }, [data]);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6 h-[500px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
          <IconCategory className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      
      <div className="space-y-3 h-[400px] overflow-y-auto pr-2">
        {Object.entries(data)
          .sort(([, a], [, b]) => b - a) // Ordenar por valor descendente
          .map(([key, value]) => {
          const animatedValue = animatedData[key] || 0;
          const percentage = maxValue > 0 ? (animatedValue / maxValue) * 100 : 0;
          const itemInfo = getItemInfo(key, title);
          const Icon = itemInfo.icon;
          
          return (
            <div key={key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-all duration-200">
              <div className={`p-2 rounded-lg ${itemInfo.bgColor} shadow-sm flex-shrink-0`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {key}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white ml-2 flex-shrink-0">
                    {animatedValue.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-3 relative overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-300 ease-out shadow-sm"
                    style={{
                      backgroundColor: itemInfo.color,
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Resumen en la parte inferior */}
      <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Total elementos: {Object.keys(data).length}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            Total: {Object.values(animatedData).reduce((sum, val) => sum + val, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
