import { useState, useEffect, useCallback } from 'react';

export interface EngagementMetric {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    change: number;
}

export interface EngagementMetrics {
    visualizaciones: EngagementMetric;
    reacciones: EngagementMetric;
    comentarios: EngagementMetric;
    compartidos: EngagementMetric;
    nuevos_posts: EngagementMetric;
}

export interface EngagementResponse {
    success: boolean;
    metrics: EngagementMetrics;
    period: {
        label: string;
        start: string;
        end: string;
        posts: number;
    };
    totalPosts: number;
    timestamp: string;
}

export interface DetailedEngagementData {
    date: string;
    visualizaciones: number;
    reacciones: number;
    comentarios: number;
    compartidos: number;
    posts: number;
    totalEngagement: number;
}

export interface DetailedEngagementResponse {
    success: boolean;
    data: DetailedEngagementData[];
    summary: {
        totalPosts: number;
        totalVisualizaciones: number;
        totalReacciones: number;
        totalComentarios: number;
        totalCompartidos: number;
    };
    dateRange: {
        startDate: string;
        endDate: string;
    };
    groupBy: string;
    timestamp: string;
}

export interface TopPost {
    id: number;
    claim: string;
    red_social: string;
    status: string;
    submitted_at: string;
    engagement: {
        visualizaciones: number;
        reacciones: number;
        comentarios: number;
        compartidos: number;
        total: number;
    };
}

export interface TopPostsResponse {
    success: boolean;
    posts: TopPost[];
    summary: {
        totalPosts: number;
        period: string;
        metric: string;
        limit: number;
    };
    timestamp: string;
}

export function useEngagementMetrics() {
    const [dashboardData, setDashboardData] = useState<EngagementResponse | null>(null);
    const [detailedData, setDetailedData] = useState<DetailedEngagementResponse | null>(null);
    const [topPosts, setTopPosts] = useState<TopPostsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    const fetchDashboardMetrics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${backendUrl}/api/metricas-engagement/dashboard`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: EngagementResponse = await response.json();
            setDashboardData(data);
            setIsConnected(true);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching engagement metrics:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    }, [backendUrl]);

    const fetchDetailedMetrics = useCallback(async (
        startDate?: string,
        endDate?: string,
        groupBy: 'day' | 'week' | 'month' = 'day'
    ) => {
        try {
            setError(null);

            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            params.append('groupBy', groupBy);

            const url = `${backendUrl}/api/metricas-engagement/detailed${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: DetailedEngagementResponse = await response.json();
            setDetailedData(data);
            setIsConnected(true);
            setLastUpdated(new Date());
            
            return data;
        } catch (err) {
            console.error('Error fetching detailed engagement metrics:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setIsConnected(false);
            throw err;
        }
    }, [backendUrl]);

    const fetchTopPosts = useCallback(async (
        limit: number = 10,
        metric: 'total' | 'visualizaciones' | 'reacciones' | 'comentarios' | 'compartidos' = 'total',
        period: '24h' | '7d' | '30d' = '24h'
    ) => {
        try {
            setError(null);

            const params = new URLSearchParams({
                limit: limit.toString(),
                metric,
                period
            });

            const response = await fetch(`${backendUrl}/api/metricas-engagement/top-posts?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: TopPostsResponse = await response.json();
            setTopPosts(data);
            setIsConnected(true);
            setLastUpdated(new Date());
            
            return data;
        } catch (err) {
            console.error('Error fetching top posts:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setIsConnected(false);
            throw err;
        }
    }, [backendUrl]);

    const refresh = useCallback(() => {
        fetchDashboardMetrics();
    }, [fetchDashboardMetrics]);

    useEffect(() => {
        fetchDashboardMetrics();
    }, [fetchDashboardMetrics]);

    return {
        // Data
        dashboardData,
        detailedData,
        topPosts,
        
        // Estado
        loading,
        error,
        isConnected,
        lastUpdated,
        
        // Métodos
        fetchDashboardMetrics,
        fetchDetailedMetrics,
        fetchTopPosts,
        refresh,
        
        // Computed properties para acceso fácil
        metrics: dashboardData?.metrics,
        period: dashboardData?.period,
    };
}

export default useEngagementMetrics;