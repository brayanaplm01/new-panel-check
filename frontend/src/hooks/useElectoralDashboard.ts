"use client";
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

// Interfaces para el tipado de datos electorales de la nueva implementación
interface ElectoralMetrics {
  postsConIA: number;
  postsAtacanCandidato: number;
  postsAtacanTSE: number;
  postsImitanMedio: number;
}

interface ElectoralDashboardStats {
  totalPosts: number;
  totalInteractions: number;
  electoralMetrics: ElectoralMetrics;
  casoElectoralDistribution: Record<string, number>;
  topCandidatosAtacados: Record<string, number>;
  topMediosImitados: Record<string, number>;
  formatoDistribution: Record<string, number>;
  redSocialDistribution: Record<string, number>;
}

interface CandidateAnalysisData {
  totalPostsAttackingCandidates: number;
  candidatesStats: Record<string, {
    count: number;
    totalInteractions: number;
    byFormat: Record<string, number>;
    bySocialMedia: Record<string, number>;
    byStatus: Record<string, number>;
  }>;
}

interface TemporalAnalysisData {
  groupBy: string;
  temporalStats: Record<string, {
    totalPosts: number;
    totalInteractions: number;
    postsConIA: number;
    postsAtacanCandidato: number;
    postsAtacanTSE: number;
    postsImitanMedio: number;
    byStatus: Record<string, number>;
    byFormat: Record<string, number>;
  }>;
}

interface UseElectoralDashboardOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  startDate?: Date | null;
  endDate?: Date | null;
}

interface UseElectoralDashboardReturn {
  // Estados principales
  dashboardStats: ElectoralDashboardStats | null;
  candidatesAnalysis: CandidateAnalysisData | null;
  temporalAnalysis: TemporalAnalysisData | null;
  
  // Estados de carga y error
  loading: boolean;
  loadingCandidates: boolean;
  loadingTemporal: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Métodos
  fetchDashboardStats: (startDate?: Date | null, endDate?: Date | null) => Promise<void>;
  fetchCandidatesAnalysis: (startDate?: Date | null, endDate?: Date | null) => Promise<void>;
  fetchTemporalAnalysis: (startDate?: Date | null, endDate?: Date | null, groupBy?: string) => Promise<void>;
  setDateRange: (startDate: Date | null, endDate: Date | null) => void;
  
  // Filtros activos
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const useElectoralDashboard = ({
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutos
  startDate = null,
  endDate = null
}: UseElectoralDashboardOptions = {}): UseElectoralDashboardReturn => {
  
  // Estados principales
  const [dashboardStats, setDashboardStats] = useState<ElectoralDashboardStats | null>(null);
  const [candidatesAnalysis, setCandidatesAnalysis] = useState<CandidateAnalysisData | null>(null);
  const [temporalAnalysis, setTemporalAnalysis] = useState<TemporalAnalysisData | null>(null);
  
  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingTemporal, setLoadingTemporal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Filtros
  const [dateRange, setDateRangeState] = useState({
    startDate,
    endDate
  });

  // Función para construir parámetros de URL con fechas
  const buildDateParams = useCallback((start?: Date | null, end?: Date | null) => {
    const params = new URLSearchParams();
    
    if (start) {
      params.append('startDate', format(start, 'yyyy-MM-dd'));
    }
    if (end) {
      params.append('endDate', format(end, 'yyyy-MM-dd'));
    }
    
    return params.toString();
  }, []);

  // 1. Fetch estadísticas del dashboard electoral
  const fetchDashboardStats = useCallback(async (start?: Date | null, end?: Date | null) => {
    try {
      setLoading(true);
      setError(null);
      
      const targetStartDate = start !== undefined ? start : dateRange.startDate;
      const targetEndDate = end !== undefined ? end : dateRange.endDate;
      
      const params = buildDateParams(targetStartDate, targetEndDate);
      const url = `${API_BASE_URL}/electoral-analysis/dashboard-stats${params ? `?${params}` : ''}`;
      
      console.log('🏛️ Fetching electoral dashboard stats from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${response.statusText} - ${errorText}`);
      }

      const data: ElectoralDashboardStats = await response.json();
      setDashboardStats(data);
      setLastUpdated(new Date());
      setError(null);
      
      console.log('📊 Electoral dashboard stats loaded:', data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar estadísticas del dashboard electoral';
      setError(errorMessage);
      console.error('Error fetching electoral dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate, buildDateParams]);

  // 2. Fetch análisis de candidatos
  const fetchCandidatesAnalysis = useCallback(async (start?: Date | null, end?: Date | null) => {
    try {
      setLoadingCandidates(true);
      
      const targetStartDate = start !== undefined ? start : dateRange.startDate;
      const targetEndDate = end !== undefined ? end : dateRange.endDate;
      
      const params = buildDateParams(targetStartDate, targetEndDate);
      const url = `${API_BASE_URL}/electoral-analysis/candidates-analysis${params ? `?${params}` : ''}`;
      
      console.log('👥 Fetching candidates analysis from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data: CandidateAnalysisData = await response.json();
      setCandidatesAnalysis(data);
      
      console.log('👥 Candidates analysis loaded:', data);
      
    } catch (err) {
      console.error('Error fetching candidates analysis:', err);
    } finally {
      setLoadingCandidates(false);
    }
  }, [dateRange.startDate, dateRange.endDate, buildDateParams]);

  // 3. Fetch análisis temporal
  const fetchTemporalAnalysis = useCallback(async (
    start?: Date | null, 
    end?: Date | null, 
    groupBy: string = 'day'
  ) => {
    try {
      setLoadingTemporal(true);
      
      const targetStartDate = start !== undefined ? start : dateRange.startDate;
      const targetEndDate = end !== undefined ? end : dateRange.endDate;
      
      const params = buildDateParams(targetStartDate, targetEndDate);
      const url = `${API_BASE_URL}/electoral-analysis/temporal-analysis${params ? `?${params}&groupBy=${groupBy}` : `?groupBy=${groupBy}`}`;
      
      console.log('📈 Fetching temporal analysis from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data: TemporalAnalysisData = await response.json();
      setTemporalAnalysis(data);
      
      console.log('📈 Temporal analysis loaded:', data);
      
    } catch (err) {
      console.error('Error fetching temporal analysis:', err);
    } finally {
      setLoadingTemporal(false);
    }
  }, [dateRange.startDate, dateRange.endDate, buildDateParams]);

  // Función para actualizar el rango de fechas
  const setDateRange = useCallback((start: Date | null, end: Date | null) => {
    setDateRangeState({ startDate: start, endDate: end });
  }, []);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Efecto para auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDashboardStats]);

  // Efecto para recargar cuando cambian las fechas
  useEffect(() => {
    fetchDashboardStats();
  }, [dateRange.startDate, dateRange.endDate, fetchDashboardStats]);

  return {
    // Estados principales
    dashboardStats,
    candidatesAnalysis,
    temporalAnalysis,
    
    // Estados de carga y error
    loading,
    loadingCandidates,
    loadingTemporal,
    error,
    lastUpdated,
    
    // Métodos
    fetchDashboardStats,
    fetchCandidatesAnalysis,
    fetchTemporalAnalysis,
    setDateRange,
    
    // Filtros activos
    dateRange,
  };
};
