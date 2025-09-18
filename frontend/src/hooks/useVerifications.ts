import { useState, useEffect, useCallback } from 'react';

export interface VerificationStats {
    total: number;
    verified: number;
    false: number;
    inProgress: number;
    misleading: number;
    incomplete: number;
    notStarted: number;
    withSource: number;
    withoutSource: number;
    recentVerifications: number;
    pendingReview: number;
    totalInteractions: number;
}

export interface VerificationPercentages {
    verifiedPercentage: number;
    falsePercentage: number;
    pendingPercentage: number;
}

export interface DashboardResponse {
    success: boolean;
    stats: VerificationStats;
    percentages: VerificationPercentages;
    timestamp: string;
}

export interface DetailedStats {
    success: boolean;
    verificationStats: VerificationStats;
    statusBreakdown: Record<string, number>;
    monthlyStats: Record<string, number>;
    socialNetworkStats: Record<string, number>;
    formatStats: Record<string, number>;
    creatorStats: Record<string, number>;
    totalPosts: number;
    timestamp: string;
}

export function useVerifications() {
    const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
    const [detailedData, setDetailedData] = useState<DetailedStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

    const fetchDashboardStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${backendUrl}/api/verifications/dashboard`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: DashboardResponse = await response.json();
            setDashboardData(data);
            setIsConnected(true);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    }, [backendUrl]);

    const fetchDetailedStats = useCallback(async (
        date?: string, 
        startDate?: string, 
        endDate?: string
    ) => {
        try {
            setError(null);

            const params = new URLSearchParams();
            if (date) params.append('date', date);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const url = `${backendUrl}/api/verifications/stats${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: DetailedStats = await response.json();
            setDetailedData(data);
            setIsConnected(true);
            setLastUpdated(new Date());
            
            return data;
        } catch (err) {
            console.error('Error fetching detailed stats:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setIsConnected(false);
            throw err;
        }
    }, [backendUrl]);

    const fetchVerificationsByDateRange = useCallback(async (
        startDate: string,
        endDate: string,
        groupBy: 'day' | 'week' | 'month' = 'day'
    ) => {
        try {
            setError(null);

            const params = new URLSearchParams({
                startDate,
                endDate,
                groupBy
            });

            const response = await fetch(`${backendUrl}/api/verifications/date-range?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setIsConnected(true);
            setLastUpdated(new Date());
            
            return data;
        } catch (err) {
            console.error('Error fetching verifications by date range:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setIsConnected(false);
            throw err;
        }
    }, [backendUrl]);

    const refresh = useCallback(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    return {
        // Dashboard data
        dashboardData,
        detailedData,
        
        // Estado
        loading,
        error,
        isConnected,
        lastUpdated,
        
        // Métodos
        fetchDashboardStats,
        fetchDetailedStats,
        fetchVerificationsByDateRange,
        refresh,
        
        // Computed properties para acceso fácil
        stats: dashboardData?.stats,
        percentages: dashboardData?.percentages,
    };
}

export default useVerifications;