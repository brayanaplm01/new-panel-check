class VerificationsController {
    constructor(database) {
        this.database = database;
    }

    async getVerificationStats(req, res) {
        try {
            const { date, startDate, endDate } = req.query;
            let allPosts;
            
            // Obtener todos los posts
            const allPostsData = await this.database.getPosts(10000, 0);
            
            if (date) {
                // Filtrar por fecha específica
                const targetDate = new Date(date + 'T00:00:00.000Z');
                const startOfDay = new Date(targetDate);
                const endOfDay = new Date(targetDate);
                endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
                endOfDay.setUTCMilliseconds(-1);
                
                allPosts = allPostsData.filter(post => {
                    if (!post.submitted_at) return false;
                    const postDate = new Date(post.submitted_at);
                    return postDate >= startOfDay && postDate <= endOfDay;
                });
            } else if (startDate && endDate) {
                // Filtrar por rango de fechas
                const start = new Date(startDate + 'T00:00:00.000Z');
                const end = new Date(endDate + 'T23:59:59.999Z');
                
                allPosts = allPostsData.filter(post => {
                    if (!post.submitted_at) return false;
                    const postDate = new Date(post.submitted_at);
                    return postDate >= start && postDate <= end;
                });
            } else {
                // Sin filtro - todos los posts
                allPosts = allPostsData;
            }
            
            // Estadísticas básicas de verificaciones
            const verificationStats = {
                total: allPosts.length,
                verified: 0, // Status: 'Verificado'
                false: 0,    // Status: 'Falso'
                inProgress: 0, // Status: 'En progreso'
                misleading: 0, // Status: 'Engañoso'
                incomplete: 0, // Status: 'Inconcluso'
                notStarted: 0, // Status: 'Sin iniciar'
                withSource: 0, // Tiene fuente definida
                withoutSource: 0
            };
            
            // Estadísticas por status detalladas
            const statusBreakdown = {};
            
            // Estadísticas por mes/fecha
            const monthlyStats = {};
            
            // Estadísticas por red social
            const socialNetworkStats = {};
            
            // Estadísticas por formato
            const formatStats = {};
            
            // Estadísticas por creador
            const creatorStats = {};
            
            allPosts.forEach(post => {
                const status = post.status || 'Sin iniciar';
                
                // Contadores básicos
                switch (status) {
                    case 'Verificado':
                        verificationStats.verified++;
                        break;
                    case 'Falso':
                        verificationStats.false++;
                        break;
                    case 'En progreso':
                        verificationStats.inProgress++;
                        break;
                    case 'Engañoso':
                        verificationStats.misleading++;
                        break;
                    case 'Inconcluso':
                        verificationStats.incomplete++;
                        break;
                    case 'Sin iniciar':
                        verificationStats.notStarted++;
                        break;
                }
                
                // Verificaciones con/sin fuente
                if (post.item_page_url || post.created_by) {
                    verificationStats.withSource++;
                } else {
                    verificationStats.withoutSource++;
                }
                
                // Breakdown por status
                statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
                
                // Estadísticas mensuales
                if (post.submitted_at) {
                    const postDate = new Date(post.submitted_at);
                    const monthKey = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}`;
                    monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
                }
                
                // Por red social
                const social = post.red_social || 'Sin especificar';
                socialNetworkStats[social] = (socialNetworkStats[social] || 0) + 1;
                
                // Por formato
                const format = post.formato || 'Sin formato';
                formatStats[format] = (formatStats[format] || 0) + 1;
                
                // Por creador
                const creator = post.created_by || 'Sistema';
                creatorStats[creator] = (creatorStats[creator] || 0) + 1;
            });

            res.json({
                success: true,
                verificationStats,
                statusBreakdown,
                monthlyStats,
                socialNetworkStats,
                formatStats,
                creatorStats,
                totalPosts: allPosts.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching verification statistics:', error);
            res.status(500).json({ error: 'Error fetching verification statistics' });
        }
    }

    async getDashboardStats(req, res) {
        try {
            // Obtener estadísticas básicas para el dashboard principal
            const allPosts = await this.database.getPosts(10000, 0);
            
            const dashboardStats = {
                total: allPosts.length,
                verified: allPosts.filter(p => p.status === 'Verificado').length,
                false: allPosts.filter(p => p.status === 'Falso').length,
                inProgress: allPosts.filter(p => p.status === 'En progreso').length,
                misleading: allPosts.filter(p => p.status === 'Engañoso').length,
                incomplete: allPosts.filter(p => p.status === 'Inconcluso').length,
                notStarted: allPosts.filter(p => p.status === 'Sin iniciar').length,
                withSource: allPosts.filter(p => p.item_page_url || p.created_by).length,
                
                // Estadísticas adicionales útiles para el dashboard
                recentVerifications: allPosts.filter(p => {
                    if (!p.updated_at) return false;
                    const updateDate = new Date(p.updated_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return updateDate >= weekAgo;
                }).length,
                
                pendingReview: allPosts.filter(p => 
                    p.status === 'En progreso' || p.status === 'Sin iniciar'
                ).length,
                
                totalInteractions: allPosts.reduce((sum, post) => {
                    return sum + (post.reacciones || 0) + (post.comentarios || 0) + 
                           (post.compartidos || 0) + (post.visualizaciones || 0);
                }, 0)
            };
            
            // Porcentajes para mejorar la presentación
            const percentages = {
                verifiedPercentage: dashboardStats.total > 0 ? 
                    Math.round((dashboardStats.verified / dashboardStats.total) * 100) : 0,
                falsePercentage: dashboardStats.total > 0 ? 
                    Math.round((dashboardStats.false / dashboardStats.total) * 100) : 0,
                pendingPercentage: dashboardStats.total > 0 ? 
                    Math.round((dashboardStats.pendingReview / dashboardStats.total) * 100) : 0
            };

            res.json({
                success: true,
                stats: dashboardStats,
                percentages,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({ error: 'Error fetching dashboard stats' });
        }
    }

    async getVerificationsByDateRange(req, res) {
        try {
            const { startDate, endDate, groupBy = 'day' } = req.query;
            
            if (!startDate || !endDate) {
                return res.status(400).json({ 
                    error: 'Start date and end date are required' 
                });
            }
            
            const start = new Date(startDate + 'T00:00:00.000Z');
            const end = new Date(endDate + 'T23:59:59.999Z');
            
            const allPosts = await this.database.getPosts(10000, 0);
            
            // Filtrar por rango de fechas
            const filteredPosts = allPosts.filter(post => {
                if (!post.submitted_at) return false;
                const postDate = new Date(post.submitted_at);
                return postDate >= start && postDate <= end;
            });
            
            // Agrupar por período (día, semana, mes)
            const groupedData = {};
            
            filteredPosts.forEach(post => {
                const postDate = new Date(post.submitted_at);
                let groupKey;
                
                switch (groupBy) {
                    case 'week':
                        // Agrupar por semana
                        const startOfWeek = new Date(postDate);
                        startOfWeek.setDate(postDate.getDate() - postDate.getDay());
                        groupKey = startOfWeek.toISOString().split('T')[0];
                        break;
                    case 'month':
                        // Agrupar por mes
                        groupKey = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}`;
                        break;
                    default:
                        // Agrupar por día
                        groupKey = postDate.toISOString().split('T')[0];
                }
                
                if (!groupedData[groupKey]) {
                    groupedData[groupKey] = {
                        date: groupKey,
                        total: 0,
                        verified: 0,
                        false: 0,
                        inProgress: 0,
                        misleading: 0
                    };
                }
                
                groupedData[groupKey].total++;
                
                switch (post.status) {
                    case 'Verificado':
                        groupedData[groupKey].verified++;
                        break;
                    case 'Falso':
                        groupedData[groupKey].false++;
                        break;
                    case 'En progreso':
                        groupedData[groupKey].inProgress++;
                        break;
                    case 'Engañoso':
                        groupedData[groupKey].misleading++;
                        break;
                }
            });

            // Convertir a array y ordenar por fecha
            const result = Object.values(groupedData).sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );

            res.json({
                success: true,
                data: result,
                totalPosts: filteredPosts.length,
                dateRange: { startDate, endDate },
                groupBy,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching verifications by date range:', error);
            res.status(500).json({ error: 'Error fetching verifications by date range' });
        }
    }
}

module.exports = VerificationsController;