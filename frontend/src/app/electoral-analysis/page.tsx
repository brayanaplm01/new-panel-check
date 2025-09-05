"use client";
import React, { useState, useEffect } from 'react';
import { IconRefresh, IconChartBar, IconFilter, IconTag, IconCalendar, IconAlertTriangle, IconCheck, IconBrain } from '@tabler/icons-react';
import { useElectoralAnalysis } from '@/hooks/useElectoralAnalysis';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';
import { AnimatedChart } from '@/components/charts/AnimatedChart';

export default function ElectoralAnalysisPage() {
  const { data, loading, error, lastUpdated, fetchData } = useElectoralAnalysis();
  
  // Estados para los filtros
  const [selectedTag, setSelectedTag] = useState('DesinfoElecciones2025');
  const [startDate, setStartDate] = useState('2025-09-01');
  const [endDate, setEndDate] = useState('2025-09-30');

  // Actualizar datos cuando cambien los filtros
  useEffect(() => {
    fetchData(selectedTag, startDate, endDate);
  }, [selectedTag, startDate, endDate, fetchData]);

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
  };

  const handleRefresh = () => {
    fetchData(selectedTag, startDate, endDate);
  };

  // Estados de carga y error
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando análisis electoral...</p>
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

  const getTimeRangeLabel = () => {
    if (startDate === endDate) {
      return new Date(startDate).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return `${new Date(startDate).toLocaleDateString('es-ES')} - ${new Date(endDate).toLocaleDateString('es-ES')}`;
  };

  const getChartTitle = () => {
    if (selectedTag === 'DesinfoElecciones2025') {
      return 'Distribución por Narrativas de Desinformación Electoral';
    } else if (selectedTag === 'ContenidoElecciones2025') {
      return 'Distribución por Narrativas de Ataques al TSE';
    }
    return 'Distribución por Narrativas';
  };

  const getChartDescription = () => {
    if (selectedTag === 'DesinfoElecciones2025') {
      return 'Cantidad de publicaciones por tipo de narrativa de desinformación detectada';
    } else if (selectedTag === 'ContenidoElecciones2025') {
      return 'Cantidad de publicaciones por tipo de narrativa de ataque al TSE detectada';
    }
    return 'Cantidad de publicaciones por tipo de narrativa detectada';
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Análisis Electoral 2025
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Análisis de narrativas de desinformación electoral por período
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
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6 opacity-0 animate-fade-in-up delay-100 z-0">
        <div className="flex items-center gap-3 mb-4">
          <IconFilter className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtros de Análisis
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por etiqueta */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <IconTag className="h-4 w-4" />
              Tipo de Contenido
            </label>
            <select
              value={selectedTag}
              onChange={(e) => handleTagChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="DesinfoElecciones2025">Desinformación Electoral 2025</option>
              <option value="ContenidoElecciones2025">Contenido Electoral 2025</option>
            </select>
          </div>

          {/* Filtro fecha inicio */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <IconCalendar className="h-4 w-4" />
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro fecha fin */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <IconCalendar className="h-4 w-4" />
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Botones de acceso rápido */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Accesos Rápidos:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setStartDate(today);
                setEndDate(today);
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={() => {
                setStartDate('2025-09-01');
                setEndDate('2025-09-30');
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              Septiembre 2025
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                setStartDate(weekAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => {
                setStartDate('2025-09-03');
                setEndDate('2025-09-03');
              }}
              className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded transition-colors"
            >
              3 de Sept
            </button>
          </div>
        </div>

        {/* Resumen de filtros activos */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Analizando:</strong> Publicaciones electorales · {getTimeRangeLabel()}
            {data && (
              <span className="ml-2">
                • <strong>{data.totalWithNarratives || data.totalPosts}</strong> con narrativas 
                • <strong>{data.totalWithoutNarratives || 0}</strong> sin narrativas
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Gráfica principal */}
      {data && data.narratives && (
        <div className="opacity-0 animate-fade-in-up delay-200">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <IconChartBar className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getChartTitle()}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getChartDescription()}
                </p>
              </div>
            </div>

            <AnimatedChart
              title=""
              data={data.narratives}
              color="rgb(59, 130, 246)"
            />
          </div>
        </div>
      )}

      {/* Narrativas Individuales de DesinfoElecciones2025 */}
      {data && data.desinfoNarratives && Object.keys(data.desinfoNarratives).length > 0 && (
        <div className="opacity-0 animate-fade-in-up delay-250">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <IconBrain className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Narrativas de Desinformación Electoral 2025
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Distribución de publicaciones por tipo de narrativa específica ({getTimeRangeLabel()})
                </p>
              </div>
            </div>

            <AnimatedChart
              title=""
              data={data.desinfoNarratives}
              color="rgb(239, 68, 68)"
            />

            {/* Lista de narrativas con conteos */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(data.desinfoNarratives)
                .sort(([,a], [,b]) => b - a) // Ordenar por cantidad descendente
                .map(([narrative, count]) => (
                <div 
                  key={narrative}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate mr-2">
                    {narrative}
                  </span>
                  <span className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs font-bold">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Narrativas Individuales de ContenidoElecciones2025 (TSE) */}
      {data && data.contenidoNarratives && Object.keys(data.contenidoNarratives).length > 0 && (
        <div className="opacity-0 animate-fade-in-up delay-275">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <IconAlertTriangle className="h-6 w-6 text-orange-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Narrativas de Contenido Electoral 2025 (TSE)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Distribución de publicaciones por tipo de narrativa contra el TSE ({getTimeRangeLabel()})
                </p>
              </div>
            </div>

            <AnimatedChart
              title=""
              data={data.contenidoNarratives}
              color="rgb(245, 158, 11)"
            />

            {/* Lista de narrativas TSE con conteos */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(data.contenidoNarratives)
                .sort(([,a], [,b]) => b - a) // Ordenar por cantidad descendente
                .map(([narrative, count]) => (
                <div 
                  key={narrative}
                  className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate mr-2">
                    {narrative}
                  </span>
                  <span className="bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs font-bold">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detalle de Narrativas */}
      {data && data.narrativeDetails && (
        <div className="opacity-0 animate-fade-in-up delay-200">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Narrativas Específicas Detectadas
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Narrativas de Desinformación */}
              {data.narrativeDetails['DesinfoElecciones2025'] && Object.keys(data.narrativeDetails['DesinfoElecciones2025']).length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-3">
                    Desinformación Electoral ({data.narratives['DesinfoElecciones2025']} posts)
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(data.narrativeDetails['DesinfoElecciones2025']).map(([narrative, count]) => (
                      <div key={narrative} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{narrative}</span>
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Narrativas de Contenido Electoral */}
              {data.narrativeDetails['ContenidoElecciones2025'] && Object.keys(data.narrativeDetails['ContenidoElecciones2025']).length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-3">
                    Contenido Electoral ({data.narratives['ContenidoElecciones2025']} posts)
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(data.narrativeDetails['ContenidoElecciones2025']).map(([narrative, count]) => (
                      <div key={narrative} className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{narrative}</span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {(!data.narrativeDetails['DesinfoElecciones2025'] || Object.keys(data.narrativeDetails['DesinfoElecciones2025']).length === 0) &&
             (!data.narrativeDetails['ContenidoElecciones2025'] || Object.keys(data.narrativeDetails['ContenidoElecciones2025']).length === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No se encontraron publicaciones con narrativas asignadas en el período seleccionado
                <div className="text-sm mt-1">({getTimeRangeLabel()})</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sección: Publicaciones SIN Narrativas */}
      {data && data.withoutNarratives && (
        <div className="opacity-0 animate-fade-in-up delay-400">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <IconAlertTriangle className="h-6 w-6 text-amber-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Publicaciones sin Narrativa Asignada
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Publicaciones con etiquetas electorales que aún no tienen narrativas específicas asignadas
                </p>
              </div>
            </div>

            {(data.withoutNarratives['DesinfoElecciones2025'] > 0 || data.withoutNarratives['ContenidoElecciones2025'] > 0) ? (
              <AnimatedChart
                title=""
                data={data.withoutNarratives}
                color="rgb(245, 158, 11)"
              />
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <IconCheck className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <div>¡Excelente! Todas las publicaciones tienen narrativas asignadas</div>
                <div className="text-sm mt-1">({getTimeRangeLabel()})</div>
              </div>
            )}

            {/* Resumen de trabajo pendiente */}
            {(data.withoutNarratives['DesinfoElecciones2025'] > 0 || data.withoutNarratives['ContenidoElecciones2025'] > 0) && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Trabajo Pendiente:
                </h4>
                <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                  {data.withoutNarratives['DesinfoElecciones2025'] > 0 && (
                    <li>
                      • <strong>{data.withoutNarratives['DesinfoElecciones2025']}</strong> publicaciones de desinformación sin narrativa
                    </li>
                  )}
                  {data.withoutNarratives['ContenidoElecciones2025'] > 0 && (
                    <li>
                      • <strong>{data.withoutNarratives['ContenidoElecciones2025']}</strong> publicaciones de contenido electoral sin narrativa
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estadísticas rápidas */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-0 animate-fade-in-up delay-500">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.totalWithNarratives || data.totalPosts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Con Narrativas
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {data.totalWithoutNarratives || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sin Narrativas
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.narrativeDetails ? 
                Object.values(data.narrativeDetails).reduce((total, narratives) => 
                  total + Object.keys(narratives).length, 0
                ) : Object.keys(data.narratives).length
              }
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Narrativas Específicas
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.totalPosts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total General
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator durante refresh */}
      {loading && data && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm">Actualizando análisis...</span>
        </div>
      )}
    </div>
  );
}
