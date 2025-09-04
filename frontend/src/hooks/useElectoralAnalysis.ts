"use client";
import { useState, useEffect, useCallback } from 'react';

interface ElectoralAnalysisData {
  narratives: Record<string, number>;
  narrativeDetails: Record<string, Record<string, number>>;
  desinfoNarratives: Record<string, number>; // Conteos individuales de narrativas de desinformación
  contenidoNarratives: Record<string, number>; // Conteos individuales de narrativas de TSE
  withoutNarratives: Record<string, number>;
  totalPosts: number;
  totalWithNarratives: number;
  totalWithoutNarratives: number;
  filters: {
    tag: string;
    timeRange: string;
    startDate: string;
    endDate: string;
    includeNarratives: boolean;
  };
}

interface UseElectoralAnalysisReturn {
  data: ElectoralAnalysisData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchData: (tag: string, startDate?: string, endDate?: string) => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const useElectoralAnalysis = (): UseElectoralAnalysisReturn => {
  const [data, setData] = useState<ElectoralAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (tag: string = 'DesinfoElecciones2025', startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir URL con parámetros de fecha
      let url = `${API_BASE_URL}/electoral/analysis?tag=${encodeURIComponent(tag)}`;
      
      if (startDate) {
        url += `&startDate=${startDate}`;
      }
      if (endDate) {
        url += `&endDate=${endDate}`;
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

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar análisis electoral');
      console.error('Error fetching electoral analysis:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    fetchData,
  };
};
