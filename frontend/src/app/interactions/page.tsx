"use client";
import React, { useState } from 'react';
import { useInteractionStats } from '@/hooks/useInteractionStats';
import { useCountUp } from '@/hooks/useCountUp';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';
import { AnimatedChart } from '@/components/charts/AnimatedChart';
import { DatePicker } from '@/components/ui/DatePicker';
import { IconRefresh, IconTrendingUp, IconCalendar, IconFilter } from '@tabler/icons-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function InteractionsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { stats, loading, error, lastUpdated, fetchStats, setFilterDate, filterDate } = useInteractionStats({
    autoRefresh: true,
    refreshInterval: 60000,
    filterDate: selectedDate
  });

  // Manejar cambio de fecha
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setFilterDate(date);
  };

  // Manejar actualización manual
  const handleRefresh = () => {
    fetchStats(filterDate);
  };

  // Animaciones para los números del resumen
  const totalInteractionsCount = useCountUp({ 
    end: stats?.totalInteractions || 0, 
    duration: 2500, 
    delay: 600 
  });
  
  const socialMediaCount = useCountUp({ 
    end: Object.keys(stats?.socialMedia || {}).length, 
    duration: 1500, 
    delay: 700 
  });
  
  const statusCount = useCountUp({ 
    end: Object.keys(stats?.status || {}).length, 
    duration: 1500, 
    delay: 800 
  });
  
  const formatCount = useCountUp({ 
    end: Object.keys(stats?.format || {}).length, 
    duration: 1500, 
    delay: 900 
  });
  
  const tagsCount = useCountUp({ 
    end: Object.keys(stats?.tags || {}).length, 
    duration: 1500, 
    delay: 1000 
  });

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Cargando estadísticas de interacciones
            {selectedDate && (
              <span className="block text-sm mt-1">
                para el {format(selectedDate, 'dd/MM/yyyy')}
              </span>
            )}
            ...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-red-800 font-semibold mb-2">Error de conexión</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 opacity-0 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Interacciones Acumuladas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Análisis de interacciones por categorías
              {filterDate && (
                <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                  • {format(filterDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <ConnectionStatus 
              isConnected={!error}
              lastUpdated={lastUpdated}
            />
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
            >
              <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <IconFilter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filtros:
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <IconCalendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Fecha:
              </label>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                placeholder="Todas las fechas"
                className="w-48"
                disabled={loading}
              />
            </div>

            {/* Indicador de filtro activo */}
            {filterDate && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                <span>Filtrado por fecha</span>
                <button
                  onClick={() => handleDateChange(null)}
                  className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  <IconRefresh className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6 opacity-0 animate-fade-in-up delay-100">
          <div className="flex items-center gap-3 mb-4">
            <IconTrendingUp className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Resumen General
              {filterDate && (
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  ({format(filterDate, 'dd/MM/yyyy')})
                </span>
              )}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalInteractionsCount.count.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Interacciones
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {socialMediaCount.count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Redes Sociales
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {statusCount.count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Estados
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatCount.count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Formatos
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {tagsCount.count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tags
              </div>
            </div>
          </div>
          
          {/* Información adicional sobre el filtro */}
          {filterDate && (
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Mostrando datos del {format(filterDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
                </span>
                <button
                  onClick={() => handleDateChange(null)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  Ver todos los datos
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid 2x2 de gráficos */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Red Social */}
          <div className="opacity-0 animate-fade-in-up delay-200">
            {stats.socialMedia ? (
              <AnimatedChart
                title="Red Social"
                data={stats.socialMedia}
                color="rgb(5, 130, 246)" // blue-500
              />
            ) : (
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6 h-[500px] flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Cargando gráfico de Red Social...</p>
              </div>
            )}
          </div>
          
          {/* Status */}
          <div className="opacity-0 animate-fade-in-up delay-300">
            <AnimatedChart
              title="Status"
              data={stats.status}
              color="rgb(16, 185, 129)" // green-500
            />
          </div>
          
          {/* Formato */}
          <div className="opacity-0 animate-fade-in-up delay-400">
            <AnimatedChart
              title="Formato"
              data={stats.format}
              color="rgb(245, 158, 11)" // yellow-500
            />
          </div>
          
          {/* Tags */}
          <div className="opacity-0 animate-fade-in-up delay-500">
            <AnimatedChart
              title="Tags"
              data={stats.tags || {}}
              color="rgb(139, 92, 246)" // purple-500
            />
          </div>
        </div>
      )}
      
      {/* Loading indicator durante refresh */}
      {loading && stats && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm">Actualizando estadísticas...</span>
        </div>
      )}
    </div>
  );
}
