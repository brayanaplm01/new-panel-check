"use client";
import React, { useState, useEffect } from 'react';
import { IconRefresh, IconFilter, IconTag, IconCalendar, IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import { useElectoralAnalysis } from '@/hooks/useElectoralAnalysis';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';
import { InteractionBarChart } from '@/components/charts/InteractionBarChart';
import { DatePicker } from '@/components/ui/DatePicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SidebarLayout } from '@/components/layouts/SideBar';
import { AuthGuard } from '@/components/auth/AuthGuard';

function ElectoralAnalysisPageContent() {
  const { data, loading, error, lastUpdated, fetchData } = useElectoralAnalysis();
  
  // Estados para los filtros
  const [selectedTag, setSelectedTag] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date('2025-09-01'));
  const [endDate, setEndDate] = useState<Date | null>(new Date('2025-09-30'));

  // Actualizar datos cuando cambien los filtros
  useEffect(() => {
    const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
    const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;
    // Si no hay tag seleccionado, usar 'DesinfoElecciones2025' por defecto para obtener la estructura de datos
    const tagToFetch = selectedTag || 'DesinfoElecciones2025';
    fetchData(tagToFetch, startDateStr, endDateStr);
  }, [selectedTag, startDate, endDate, fetchData]);

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
  };

  const handleRefresh = () => {
    const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
    const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;
    const tagToFetch = selectedTag || 'DesinfoElecciones2025';
    fetchData(tagToFetch, startDateStr, endDateStr);
  };

  // Función para obtener el rango de fechas como texto
  const getTimeRangeLabel = () => {
    if (!startDate && !endDate) {
      return 'Septiembre 2025';
    }
    if (startDate && endDate && startDate.toDateString() === endDate.toDateString()) {
      return format(startDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: es });
    }
    if (startDate && endDate) {
      return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
    }
    if (startDate) {
      return format(startDate, 'dd \'de\' MMMM \'de\' yyyy', { locale: es });
    }
    return 'Período personalizado';
  };

  // Estados de carga y error
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Cargando análisis electoral
            {(startDate || endDate) && (
              <span className="block text-sm mt-1 text-blue-600 dark:text-blue-400">
                para el período {getTimeRangeLabel()}
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
            {(startDate || endDate) && (
              <p className="text-sm text-red-500 dark:text-red-400 mb-4">
                Período: {getTimeRangeLabel()}
              </p>
            )}
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

  // Función para obtener datos de narrativas de manera consistente
  const getNarrativesData = () => {
    if (!data || !selectedTag) return {};
    
    if (selectedTag === 'DesinfoElecciones2025') {
      return data.desinfoNarratives || {};
    } else if (selectedTag === 'ContenidoElecciones2025') {
      return data.contenidoNarratives || {};
    } else {
      // Para otros tags, crear estructura vacía con las 14 narrativas
      const templateNarratives = [
        'Se está orquestando un fraude electoral',
        'Dudas sobre el proceso electoral', 
        'Campañas financiadas por terceros',
        'Candidatos y partidos ligados al MAS o a Evo Morales',
        'Ataques a candidatos o a partidos políticos',
        'Supuesto apoyo a candidatos o partidos políticos',
        'Tendencias de intención de voto (encuestas)',
        'Resistencia hostil',
        'Voto nulo',
        'Conteo preliminar de votos',
        'Promesas de campaña',
        'Escenarios postelectorales',
        'FIMI',
        'Padrón electoral'
      ];
      
      const emptyData: Record<string, number> = {};
      templateNarratives.forEach(narrative => {
        emptyData[narrative] = 0;
      });
      return emptyData;
    }
  };

  const chartData = getNarrativesData();

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 opacity-0 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Análisis Electoral 2025
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {selectedTag 
                ? `Análisis específico de ${selectedTag}`
                : 'Comparativa entre todas las etiquetas electorales disponibles'
              }
              {(startDate || endDate) && (
                <span className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                  • {getTimeRangeLabel()}
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
            
            {/* Filtro por etiqueta */}
            <div className="flex items-center gap-2">
              <IconTag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Tipo:
              </label>
              <select
                value={selectedTag}
                onChange={(e) => handleTagChange(e.target.value)}
                disabled={loading}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">Todas las comparativas</option>
                <option value="DesinfoElecciones2025">DesinfoElecciones2025</option>
                <option value="AtaqueAlTSE2025">AtaqueAlTSE2025</option>
                <option value="ContenidoElecciones2025">ContenidoElecciones2025</option>
                <option value="Contenido Judiciales 2024">Contenido Judiciales 2024</option>
                <option value="Contenidos Judiciales">Contenidos Judiciales</option>
                <option value="DesinformaciónEnMedios2025">DesinformaciónEnMedios2025</option>
                <option value="Desinformación Judiciales 2024">Desinformación Judiciales 2024</option>
                <option value="Mpox">Mpox</option>
                <option value="UnCandidatoDesinforma2025">UnCandidatoDesinforma2025</option>
              </select>
            </div>

            {/* Filtros de fecha */}
            <div className="flex items-center gap-2">
              <IconCalendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Desde:
              </label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Fecha inicio"
                className="w-40"
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Hasta:
              </label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Fecha fin"
                className="w-40"
                disabled={loading}
              />
            </div>

            {/* Botones de acceso rápido */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  const today = new Date();
                  setStartDate(today);
                  setEndDate(today);
                }}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
              >
                Hoy
              </button>
              <button
                onClick={() => {
                  setStartDate(new Date('2025-09-01'));
                  setEndDate(new Date('2025-09-30'));
                }}
                className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full transition-colors"
              >
                Septiembre 2025
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setStartDate(weekAgo);
                  setEndDate(today);
                }}
                className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-full transition-colors"
              >
                Últimos 7 días
              </button>
              <button
                onClick={() => {
                  setStartDate(new Date('2025-09-03'));
                  setEndDate(new Date('2025-09-03'));
                }}
                className="px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-full transition-colors"
              >
                3 de Sept
              </button>
            </div>

            {/* Indicador de filtro activo */}
            {(startDate || endDate) && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm ml-auto">
                <span>Filtrado: {getTimeRangeLabel()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mensaje cuando no hay datos para la fecha seleccionada */}
      {!loading && (startDate || endDate) && (!data || (data.totalPosts === 0)) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 opacity-0 animate-fade-in-up delay-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c.77.833 1.732 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Sin datos para {getTimeRangeLabel()}
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                No se encontraron publicaciones electorales con narrativas para el período seleccionado. Los datos podrían estar disponibles en otras fechas.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const today = new Date();
                    setStartDate(today);
                    setEndDate(today);
                  }}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Probar Hoy ({format(new Date(), 'dd/MM/yyyy')})
                </button>
                <button
                  onClick={() => {
                    setStartDate(new Date('2025-09-01'));
                    setEndDate(new Date('2025-09-30'));
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Septiembre 2025
                </button>
                <button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Ver Todos los Datos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfica Principal del Tag Seleccionado */}
      {data && selectedTag && (
          <div className="opacity-0 animate-fade-in-up delay-150">
            <InteractionBarChart
              title={selectedTag === 'DesinfoElecciones2025' ? 'Narrativas de Desinformación Electoral 2025' :
                     selectedTag === 'ContenidoElecciones2025' ? 'Narrativas de Contenido Electoral TSE 2025' :
                     `Narrativas de ${selectedTag}`}
              data={chartData}
            className="w-full"
            color={selectedTag === 'DesinfoElecciones2025' ? 'rgb(220, 38, 127)' : 
                   selectedTag === 'ContenidoElecciones2025' ? 'rgb(251, 146, 60)' :
                   selectedTag === 'AtaqueAlTSE2025' ? 'rgb(239, 68, 68)' :
                   selectedTag === 'DesinformaciónEnMedios2025' ? 'rgb(168, 85, 247)' :
                   selectedTag === 'UnCandidatoDesinforma2025' ? 'rgb(245, 101, 101)' :
                   selectedTag === 'Mpox' ? 'rgb(34, 197, 94)' :
                   selectedTag.includes('Judiciales') ? 'rgb(251, 146, 60)' :
                   'rgb(107, 114, 128)'}
            maxItems={15}
            useElectoralColors={selectedTag === 'DesinfoElecciones2025' || selectedTag === 'ContenidoElecciones2025'}
          />

          {/* Lista de narrativas individuales con conteos - Para todos los tags */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(chartData)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .map(([narrative, count]) => {
                const countNum = count as number;
                const maxCount = Math.max(...Object.values(chartData), 0);
                const isHighest = countNum === maxCount && countNum > 0;
                const hasData = countNum > 0;
                
                // Determinar colores basado en el conteo
                let cardClasses = '';
                let badgeClasses = '';
                
                if (isHighest) {
                  // Rojo para el más alto
                  cardClasses = 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800';
                  badgeClasses = 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200';
                } else if (hasData) {
                  // Azul para los que tienen al menos 1
                  cardClasses = 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800';
                  badgeClasses = 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200';
                } else {
                  // Plomo/gris para los que tienen 0
                  cardClasses = 'bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800';
                  badgeClasses = 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
                }
                
                return (
                  <div 
                    key={narrative}
                    className={`flex items-center justify-between p-3 rounded-lg border ${cardClasses}`}
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate mr-2">
                        {narrative}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${badgeClasses}`}>
                      {countNum}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Gráfica Comparativa de Tags Electorales - Solo cuando no hay tag específico seleccionado */}
      {data && data.allTagCounts && !selectedTag && (
        <div className="opacity-0 animate-fade-in-up delay-175">
          <InteractionBarChart
            title="Comparativa de Publicaciones Electorales"
            data={data.allTagCounts}
            className="w-full"
            color="rgb(147, 51, 234)"
            maxItems={10}
          />

          {/* Resumen comparativo */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Desinformación Electoral
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Publicaciones con contenido de desinformación
                </p>
              </div>
              <span className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-3 py-2 rounded-full text-lg font-bold">
                {data.allTagCounts['DesinfoElecciones2025'] || 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Contenido Electoral TSE
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Publicaciones sobre contenido electoral general
                </p>
              </div>
              <span className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-full text-lg font-bold">
                {data.allTagCounts['ContenidoElecciones2025'] || 0}
              </span>
            </div>
          </div>

          {/* Porcentajes */}
          {(data.allTagCounts['DesinfoElecciones2025'] > 0 || data.allTagCounts['ContenidoElecciones2025'] > 0) && (
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">
                  {data.allTagCounts['DesinfoElecciones2025'] || 0} desinformación 
                </span>
                {' vs '}
                <span className="font-medium">
                  {data.allTagCounts['ContenidoElecciones2025'] || 0} contenido electoral
                </span>
                {' • '}
                <span className="text-xs">
                  Total: {(data.allTagCounts['DesinfoElecciones2025'] || 0) + (data.allTagCounts['ContenidoElecciones2025'] || 0)} publicaciones
                </span>
              </div>
            </div>
          )}
        </div>
      )}



      {/* Sección de Publicaciones SIN Narrativas - Solo cuando hay un tag específico seleccionado */}
      {data && data.withoutNarratives && selectedTag && (
        <div className="opacity-0 animate-fade-in-up delay-225">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <IconAlertTriangle className="h-6 w-6 text-gray-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Publicaciones de {selectedTag} Sin Narrativas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Publicaciones con etiqueta {selectedTag} pero sin narrativas específicas ({getTimeRangeLabel()})
                </p>
              </div>
            </div>

            {(!data.withoutNarratives[selectedTag] || data.withoutNarratives[selectedTag] === 0) ? (
              // Verificar si el tag no tiene publicaciones en absoluto
              (!data.allTagCounts || !data.allTagCounts[selectedTag] || data.allTagCounts[selectedTag] === 0) ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <IconAlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No se encontró ningún caso</p>
                  <p>No hay publicaciones de {selectedTag} en el período analizado</p>
                  <div className="text-sm mt-1">({getTimeRangeLabel()})</div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <IconCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">¡Excelente!</p>
                  <p>Todas las publicaciones de {selectedTag} tienen narrativas asignadas</p>
                  <div className="text-sm mt-1">({getTimeRangeLabel()})</div>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                  {data.withoutNarratives[selectedTag].toLocaleString()}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Publicaciones sin narrativas asignadas
                </p>
                <div className="text-sm mt-1 text-gray-500 dark:text-gray-500">
                  {getTimeRangeLabel()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estadísticas Rápidas */}
      {data && (
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-6 opacity-0 animate-fade-in-up delay-250">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resumen del Análisis
              {selectedTag && (
                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                  ({selectedTag})
                </span>
              )}
            </h3>          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {selectedTag 
                  ? (data.allTagCounts && data.allTagCounts[selectedTag] ? data.allTagCounts[selectedTag].toLocaleString() : '0')
                  : (data.totalPosts?.toLocaleString() || '0')
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedTag ? 'Publicaciones del Tag' : 'Total Publicaciones'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.totalWithNarratives?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Con Narrativas
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {selectedTag 
                  ? (data.withoutNarratives && data.withoutNarratives[selectedTag] ? data.withoutNarratives[selectedTag].toLocaleString() : '0')
                  : (data.totalWithoutNarratives?.toLocaleString() || '0')
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Sin Narrativas
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {selectedTag 
                  ? (data.allTagCounts && data.allTagCounts[selectedTag] && data.totalWithNarratives
                      ? Math.round((data.totalWithNarratives / data.allTagCounts[selectedTag]) * 100)
                      : 0)
                  : (data.totalWithNarratives && data.totalPosts 
                      ? Math.round((data.totalWithNarratives / data.totalPosts) * 100) 
                      : 0)
                }%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Cobertura
              </div>
            </div>
          </div>
          
          {/* Información adicional sobre el filtro */}
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Mostrando {selectedTag ? `datos específicos de ${selectedTag}` : 'comparativa de todas las etiquetas'} para {getTimeRangeLabel()}
              </span>
              <div className="flex gap-2">
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag('')}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium"
                  >
                    Ver comparativa
                  </button>
                )}
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate(null);
                      setEndDate(null);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    Ver todos los datos
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading indicator durante refresh */}
      {loading && data && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm">Actualizando análisis electoral...</span>
        </div>
      )}
    </div>
  );
}

// Wrapper con SidebarLayout
export default function ElectoralAnalysisPage() {
  return (
    <AuthGuard>
      <SidebarLayout>
        <ElectoralAnalysisPageContent />
      </SidebarLayout>
    </AuthGuard>
  );
}
