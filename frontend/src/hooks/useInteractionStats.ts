"use client";
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

interface InteractionStats {
  socialMedia: Record<string, number>;
  status: Record<string, number>;
  format: Record<string, number>;
  tags: Record<string, number>;
  totalInteractions: number;
}

interface UseInteractionStatsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  filterDate?: Date | null;
}

interface UseInteractionStatsReturn {
  stats: InteractionStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchStats: (date?: Date | null) => Promise<void>;
  setFilterDate: (date: Date | null) => void;
  filterDate: Date | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const useInteractionStats = ({ 
  autoRefresh = true, 
  refreshInterval = 60000, 
  filterDate = null 
}: UseInteractionStatsOptions = {}): UseInteractionStatsReturn => {
  const [stats, setStats] = useState<InteractionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentFilterDate, setCurrentFilterDate] = useState<Date | null>(filterDate);

  const fetchStats = useCallback(async (date?: Date | null) => {
    try {
      setLoading(true);
      
      // Usar la fecha proporcionada o la fecha actual del filtro
      const targetDate = date !== undefined ? date : currentFilterDate;
      
      // Construir la URL con parámetros de fecha si existe
      let url = `${API_BASE_URL}/interactions-stats`;
      if (targetDate) {
        const dateStr = format(targetDate, 'yyyy-MM-dd');
        url += `?date=${dateStr}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data: InteractionStats = await response.json();
      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas de interacciones');
      console.error('Error fetching interaction stats:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFilterDate]);

  const setFilterDate = useCallback((date: Date | null) => {
    setCurrentFilterDate(date);
    // Actualizar inmediatamente con la nueva fecha
    fetchStats(date);
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => fetchStats(), refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchStats]);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    fetchStats,
    setFilterDate,
    filterDate: currentFilterDate,
  };
};
