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

  // Verificar si hay datos
  const hasData = stats && (
    Object.values(stats.socialMedia || {}).some(val => val > 0) ||
    Object.values(stats.status || {}).some(val => val > 0) ||
    Object.values(stats.format || {}).some(val => val > 0) ||
    Object.values(stats.tags || {}).some(val => val > 0)
  );

  // Función para probar fechas comunes que podrían tener datos
  const testTodayData = () => {
    const today = new Date();
    handleDateChange(today);
  };

  const testYesterdayData = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    handleDateChange(yesterday);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Cargando estadísticas de interacciones
            {selectedDate && (
              <span className="block text-sm mt-1 text-blue-600 dark:text-blue-400">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
            <h2 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error de conexión</h2>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            {filterDate && (
              <p className="text-sm text-red-500 dark:text-red-400 mb-4">
                Filtrando por: {format(filterDate, 'dd/MM/yyyy')}
              </p>
            )}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-3 mb-4">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>💡 Consejo:</strong> Si obtienes "Failed to fetch", verifica que el backend esté ejecutándose. 
                Si hay 0 resultados, prueba con fechas de septiembre 2025 donde hay datos disponibles.
              </p>
            </div>
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
              Análisis de Publicaciones
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Distribución de publicaciones por categorías
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

      {/* Mensaje cuando no hay datos para la fecha seleccionada */}
      {!loading && filterDate && !hasData && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 opacity-0 animate-fade-in-up delay-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c.77.833 1.732 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Sin datos para {format(filterDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: es })}
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                No se encontraron interacciones para la fecha seleccionada. Los datos podrían estar disponibles en fechas más recientes.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={testTodayData}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Probar Hoy ({format(new Date(), 'dd/MM/yyyy')})
                </button>
                <button
                  onClick={testYesterdayData}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Probar Ayer ({format(new Date(Date.now() - 24*60*60*1000), 'dd/MM/yyyy')})
                </button>
                <button
                  onClick={() => handleDateChange(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Ver Todos los Datos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                Total Publicaciones
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
